import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import type { IUser, IUserWithPassword, UserRole } from "@/types";
import type { SignUpInput, UpdateProfileInput } from "@/schemas/auth.schema";

/** MD5 hashes are 32-char hex strings. bcrypt hashes always start with $2b$ / $2a$. */
function isMd5Hash(hash: string): boolean {
  return /^[a-f0-9]{32}$/i.test(hash);
}

function md5(value: string): string {
  return createHash("md5").update(value).digest("hex");
}

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

function toIUser(doc: {
  _id: unknown;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  profilePicture?: string;
  emailVerified?: boolean;
  createdAt: Date;
}): IUser {
  return {
    _id: String(doc._id),
    firstName: doc.firstName,
    lastName: doc.lastName,
    email: doc.email,
    role: doc.role,
    profilePicture: doc.profilePicture,
    emailVerified: !!doc.emailVerified,
    createdAt: doc.createdAt,
  };
}

export interface RegisterUserResult {
  user: IUser;
  verificationToken: string;
}

export async function registerUser(
  input: Omit<SignUpInput, "confirmPassword" | "hasAgreed">,
): Promise<RegisterUserResult> {
  await connectDB();

  const existing = await User.findOne({
    email: input.email.toLowerCase(),
  }).lean();
  if (existing) {
    throw new Error("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const verificationToken = generateToken();
  const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const created = await User.create({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email.toLowerCase(),
    password: passwordHash,
    role: input.role ?? "user",
    emailVerified: false,
    emailVerificationToken: verificationToken,
    emailVerificationExpiry: verificationExpiry,
  });

  return {
    user: toIUser(created.toObject()),
    verificationToken,
  };
}

export type CredentialsResult =
  | { kind: "ok"; user: IUser }
  | { kind: "invalid" }
  | { kind: "unverified" };

export async function validateCredentials(
  email: string,
  password: string,
): Promise<CredentialsResult> {
  await connectDB();

  const user = await User.findOne({ email: email.toLowerCase() }).lean<
    (IUserWithPassword & { _id: unknown; emailVerified?: boolean }) | null
  >();
  if (!user) return { kind: "invalid" };

  let passwordOk = false;

  if (isMd5Hash(user.password)) {
    passwordOk = md5(password) === user.password;

    if (passwordOk) {
      const bcryptHash = await bcrypt.hash(password, 10);
      await User.updateOne(
        { _id: user._id },
        { $set: { password: bcryptHash, emailVerified: true } },
      );
    }
  } else {
    passwordOk = await bcrypt.compare(password, user.password);
  }

  if (!passwordOk) return { kind: "invalid" };

  // Pre-existing accounts (created before this field was introduced) won't
  // have emailVerified set — treat undefined as verified so they can still
  // sign in. Only explicitly-false accounts are blocked.
  if (user.emailVerified === false) {
    return { kind: "unverified" };
  }

  return {
    kind: "ok",
    user: toIUser(user as unknown as Parameters<typeof toIUser>[0]),
  };
}

export async function getUserById(id: string): Promise<IUser | null> {
  await connectDB();
  const user = await User.findById(id).lean();
  if (!user) return null;
  return toIUser(user as unknown as Parameters<typeof toIUser>[0]);
}

export async function verifyEmailToken(token: string): Promise<IUser | null> {
  await connectDB();

  const user = await User.findOne({ emailVerificationToken: token });
  if (!user) return null;
  if (
    user.emailVerificationExpiry &&
    user.emailVerificationExpiry.getTime() < Date.now()
  ) {
    return null;
  }

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  await user.save();

  return toIUser(user.toObject());
}

export interface ForgotPasswordResult {
  user: IUser;
  resetToken: string;
}

export async function createPasswordResetToken(
  email: string,
): Promise<ForgotPasswordResult | null> {
  await connectDB();

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return null;

  const resetToken = generateToken();
  const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  user.passwordResetToken = resetToken;
  user.passwordResetExpiry = resetExpiry;
  await user.save();

  return { user: toIUser(user.toObject()), resetToken };
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string,
): Promise<boolean> {
  await connectDB();

  const user = await User.findOne({ passwordResetToken: token });
  if (!user) return false;
  if (
    user.passwordResetExpiry &&
    user.passwordResetExpiry.getTime() < Date.now()
  ) {
    return false;
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.passwordResetToken = undefined;
  user.passwordResetExpiry = undefined;
  await user.save();
  return true;
}

export async function updateUserProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<IUser | null> {
  await connectDB();
  const updated = await User.findByIdAndUpdate(
    userId,
    {
      firstName: input.firstName,
      lastName: input.lastName,
      profilePicture: input.profilePicture || undefined,
    },
    { new: true },
  ).lean();
  if (!updated) return null;
  return toIUser(updated as unknown as Parameters<typeof toIUser>[0]);
}
