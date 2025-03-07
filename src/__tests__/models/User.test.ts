import mongoose from 'mongoose';
import { User } from '../../models/User';
import { createTestUser } from '../../test/setup';

describe('User Model', () => {
  it('should create a new user', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
    };

    const user = await User.create(userData);

    expect(user).toBeDefined();
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
    expect(user.password).not.toBe(userData.password); // Password should be hashed
  });

  it('should not create user with invalid email', async () => {
    const userData = {
      name: 'John Doe',
      email: 'invalid-email',
      password: 'password123',
      passwordConfirm: 'password123',
    };

    await expect(User.create(userData)).rejects.toThrow();
  });

  it('should not create user with mismatched passwords', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      passwordConfirm: 'different-password',
    };

    await expect(User.create(userData)).rejects.toThrow();
  });

  it('should hash password before saving', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
    };

    const user = await User.create(userData);
    expect(user.password).not.toBe(userData.password);
  });

  it('should update passwordChangedAt when password is changed', async () => {
    const user = await createTestUser();
    const originalPasswordChangedAt = user.passwordChangedAt;

    user.password = 'newpassword123';
    user.passwordConfirm = 'newpassword123';
    await user.save();

    expect(user.passwordChangedAt).toBeDefined();
    expect(user.passwordChangedAt).not.toBe(originalPasswordChangedAt);
  });

  it('should create password reset token', async () => {
    const user = await createTestUser();
    const resetToken = user.createPasswordResetToken();
    await user.save();

    expect(resetToken).toBeDefined();
    expect(user.passwordResetToken).toBeDefined();
    expect(user.passwordResetExpires).toBeDefined();
  });

  it('should correctly validate password', async () => {
    const user = await createTestUser();
    const isValid = await user.correctPassword('password123', user.password);
    const isInvalid = await user.correctPassword('wrongpassword', user.password);

    expect(isValid).toBe(true);
    expect(isInvalid).toBe(false);
  });

  it('should check if password was changed after token was issued', async () => {
    const user = await createTestUser();
    const tokenIssuedAt = Math.floor(Date.now() / 1000);

    // Password not changed
    expect(user.changedPasswordAfter(tokenIssuedAt)).toBe(false);

    // Change password
    user.password = 'newpassword123';
    user.passwordConfirm = 'newpassword123';
    await user.save();

    // Password changed
    expect(user.changedPasswordAfter(tokenIssuedAt)).toBe(true);
  });
});
