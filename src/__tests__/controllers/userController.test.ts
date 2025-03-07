import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app';
import { createTestUser, getAuthToken } from '../../test/setup';
import { User } from '../../models/User';

describe('User Controller', () => {
  let adminUser: any;
  let regularUser: any;
  let adminToken: string;
  let userToken: string;

  beforeEach(async () => {
    // Create admin user
    adminUser = await createTestUser({
      email: 'admin@example.com',
      role: 'admin',
    });
    adminToken = await getAuthToken(adminUser);

    // Create regular user
    regularUser = await createTestUser({
      email: 'user@example.com',
      role: 'user',
    });
    userToken = await getAuthToken(regularUser);
  });

  describe('GET /api/v1/users', () => {
    it('should get all users when admin', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', adminToken)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.results).toBe(2);
      expect(response.body.data.users).toHaveLength(2);
    });

    it('should not get all users when not admin', async () => {
      await request(app).get('/api/v1/users').set('Authorization', userToken).expect(403);
    });

    it('should not get all users when not authenticated', async () => {
      await request(app).get('/api/v1/users').expect(401);
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should get user by id when admin', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${regularUser._id}`)
        .set('Authorization', adminToken)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user._id).toBe(regularUser._id.toString());
    });

    it('should not get user by id when not admin', async () => {
      await request(app)
        .get(`/api/v1/users/${adminUser._id}`)
        .set('Authorization', userToken)
        .expect(403);
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/api/v1/users/${nonExistentId}`)
        .set('Authorization', adminToken)
        .expect(404);
    });
  });

  describe('PATCH /api/v1/users/:id', () => {
    it('should update user when admin', async () => {
      const updateData = {
        name: 'Updated Name',
      };

      const response = await request(app)
        .patch(`/api/v1/users/${regularUser._id}`)
        .set('Authorization', adminToken)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.name).toBe(updateData.name);
    });

    it('should not update user when not admin', async () => {
      const updateData = {
        name: 'Updated Name',
      };

      await request(app)
        .patch(`/api/v1/users/${adminUser._id}`)
        .set('Authorization', userToken)
        .send(updateData)
        .expect(403);
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('should delete user when admin', async () => {
      await request(app)
        .delete(`/api/v1/users/${regularUser._id}`)
        .set('Authorization', adminToken)
        .expect(204);

      // Verify user was deleted
      const deletedUser = await User.findById(regularUser._id);
      expect(deletedUser).toBeNull();
    });

    it('should not delete user when not admin', async () => {
      await request(app)
        .delete(`/api/v1/users/${adminUser._id}`)
        .set('Authorization', userToken)
        .expect(403);

      // Verify user was not deleted
      const user = await User.findById(adminUser._id);
      expect(user).toBeDefined();
    });
  });

  describe('GET /api/v1/users/me', () => {
    it('should get current user', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', userToken)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user._id).toBe(regularUser._id.toString());
    });

    it('should not get current user when not authenticated', async () => {
      await request(app).get('/api/v1/users/me').expect(401);
    });
  });

  describe('PATCH /api/v1/users/updateMe', () => {
    it('should update current user', async () => {
      const updateData = {
        name: 'Updated Name',
      };

      const response = await request(app)
        .patch('/api/v1/users/updateMe')
        .set('Authorization', userToken)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.name).toBe(updateData.name);
    });

    it('should not update password through this route', async () => {
      const updateData = {
        name: 'Updated Name',
        password: 'newpassword123',
        passwordConfirm: 'newpassword123',
      };

      await request(app)
        .patch('/api/v1/users/updateMe')
        .set('Authorization', userToken)
        .send(updateData)
        .expect(400);
    });
  });

  describe('DELETE /api/v1/users/deleteMe', () => {
    it('should deactivate current user', async () => {
      await request(app)
        .delete('/api/v1/users/deleteMe')
        .set('Authorization', userToken)
        .expect(204);

      // Verify user was deactivated
      const deactivatedUser = await User.findById(regularUser._id);
      expect(deactivatedUser?.active).toBe(false);
    });

    it('should not deactivate user when not authenticated', async () => {
      await request(app).delete('/api/v1/users/deleteMe').expect(401);
    });
  });
});
