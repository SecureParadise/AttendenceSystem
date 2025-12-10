-- DropIndex
DROP INDEX "email_verification_tokens_userId_otp_idx";

-- CreateIndex
CREATE INDEX "email_verification_tokens_userId_otp_expiresAt_idx" ON "email_verification_tokens"("userId", "otp", "expiresAt");
