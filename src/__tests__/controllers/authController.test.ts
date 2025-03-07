import request from 'supertest';
import app from '../../app';
import { createTestUser, getAuthToken } from '../../test/setup';
import { User } from '../../models/User';

describe('Auth Controller', () => {
  describe('POST /api/v1/users/signup', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
      };

      const response = await request(app).post('/api/v1/users/signup').send(userData).expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.token).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should not create user with invalid data', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123',
        passwordConfirm: 'password123',
      };

      await request(app).post('/api/v1/users/signup').send(invalidData).expect(400);
    });
  });

  describe('POST /api/v1/users/login', () => {
    it('should login with correct credentials', async () => {
      const user = await createTestUser();
      const loginData = {
        email: user.email,
        password: 'password123',
      };

      const response = await request(app).post('/api/v1/users/login').send(loginData).expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.token).toBeDefined();
      expect(response.body.data.user).toBeDefined();
    });

    it('should not login with incorrect password', async () => {
      const user = await createTestUser();
      const loginData = {
        email: user.email,
        password: 'wrongpassword',
      };

      await request(app).post('/api/v1/users/login').send(loginData).expect(401);
    });

    it('should not login with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      await request(app).post('/api/v1/users/login').send(loginData).expect(401);
    });
  });

  describe('POST /api/v1/users/forgotPassword', () => {
    it('should send password reset token', async () => {
      const user = await createTestUser();
      const response = await request(app)
        .post('/api/v1/users/forgotPassword')
        .send({ email: user.email })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Token sent to email!');

      // Verify token was saved in database
      const updatedUser = await User.findOne({ email: user.email });
      expect(updatedUser?.passwordResetToken).toBeDefined();
      expect(updatedUser?.passwordResetExpires).toBeDefined();
    });

    it('should handle non-existent email', async () => {
      await request(app)
        .post('/api/v1/users/forgotPassword')
        .send({ email: 'nonexistent@example.com' })
        .expect(404);
    });
  });

  describe('PATCH /api/v1/users/resetPassword/:token', () => {
    it('should reset password with valid token', async () => {
      const user = await createTestUser();
      const resetToken = user.createPasswordResetToken();
      await user.save();

      const response = await request(app)
        .patch(`/api/v1/users/resetPassword/${resetToken}`)
        .send({
          password: 'newpassword123',
          passwordConfirm: 'newpassword123',
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.token).toBeDefined();

      // Verify password was changed
      const updatedUser = await User.findOne({ email: user.email });
      const isPasswordCorrect = await updatedUser?.correctPassword(
        'newpassword123',
        updatedUser.password
      );
      expect(isPasswordCorrect).toBe(true);
    });

    it('should not reset password with invalid token', async () => {
      await request(app)
        .patch('/api/v1/users/resetPassword/invalid-token')
        .send({
          password: 'newpassword123',
          passwordConfirm: 'newpassword123',
        })
        .expect(400);
    });
  });

  describe('PATCH /api/v1/users/updateMyPassword', () => {
    it('should update password when authenticated', async () => {
      const user = await createTestUser();
      const token = await getAuthToken(user);

      const response = await request(app)
        .patch('/api/v1/users/updateMyPassword')
        .set('Authorization', token)
        .send({
          currentPassword: 'password123',
          password: 'newpassword123',
          passwordConfirm: 'newpassword123',
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.token).toBeDefined();

      // Verify password was changed
      const updatedUser = await User.findOne({ email: user.email });
      const isPasswordCorrect = await updatedUser?.correctPassword(
        'newpassword123',
        updatedUser.password
      );
      expect(isPasswordCorrect).toBe(true);
    });

    it('should not update password with wrong current password', async () => {
      const user = await createTestUser();
      const token = await getAuthToken(user);

      await request(app)
        .patch('/api/v1/users/updateMyPassword')
        .set('Authorization', token)
        .send({
          currentPassword: 'wrongpassword',
          password: 'newpassword123',
          passwordConfirm: 'newpassword123',
        })
        .expect(401);
    });

    it('should not update password without authentication', async () => {
      await request(app)
        .patch('/api/v1/users/updateMyPassword')
        .send({
          currentPassword: 'password123',
          password: 'newpassword123',
          passwordConfirm: 'newpassword123',
        })
        .expect(401);
    });
  });
});
