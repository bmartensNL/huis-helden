import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpSpy: jest.Mocked<HttpClient>;

  beforeEach(() => {
    httpSpy = {
      get: jest.fn().mockReturnValue(of([])),
      post: jest.fn().mockReturnValue(of({})),
      put: jest.fn().mockReturnValue(of({})),
      delete: jest.fn().mockReturnValue(of({})),
    } as any;

    service = new ApiService(httpSpy);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getTasks calls GET /tasks', () => {
    const mockTasks = [{ id: '1', name: 'Clean room' }];
    httpSpy.get.mockReturnValue(of(mockTasks) as any);
    service.getTasks().subscribe((tasks) => {
      expect(tasks).toEqual(mockTasks);
    });
    expect(httpSpy.get).toHaveBeenCalledWith(expect.stringContaining('/tasks'));
  });

  it('completeTask calls POST /tasks/:id/complete', () => {
    service.completeTask('task-1').subscribe();
    expect(httpSpy.post).toHaveBeenCalledWith(
      expect.stringContaining('/tasks/task-1/complete'),
      {},
    );
  });

  it('getRewards calls GET /rewards', () => {
    service.getRewards().subscribe();
    expect(httpSpy.get).toHaveBeenCalledWith(expect.stringContaining('/rewards'));
  });

  it('claimReward calls POST /rewards/:id/claim', () => {
    service.claimReward('r-1').subscribe();
    expect(httpSpy.post).toHaveBeenCalledWith(
      expect.stringContaining('/rewards/r-1/claim'),
      {},
    );
  });

  it('stealTask calls POST /tasks/:id/steal', () => {
    service.stealTask('t-1').subscribe();
    expect(httpSpy.post).toHaveBeenCalledWith(
      expect.stringContaining('/tasks/t-1/steal'),
      {},
    );
  });

  it('getLeaderboard calls GET /leaderboard', () => {
    service.getLeaderboard().subscribe();
    expect(httpSpy.get).toHaveBeenCalledWith(expect.stringContaining('/leaderboard'));
  });
});
