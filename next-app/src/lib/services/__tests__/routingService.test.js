// Unit tests for routingService.js

import axios from 'axios';
import { optimizeRoute } from '../routingService';
import { Route, Stop } from '../../../../models';

jest.mock('axios');
jest.mock('../../../../models', () => ({
  Route: { update: jest.fn() },
  Stop: { update: jest.fn() },
}));

describe('optimizeRoute', () => {
  const depot = { lat: 12.9716, lng: 77.5946 };
  const stops = [
    { id: 'stop1', lat: 12.9352, lng: 77.6245 },
    { id: 'stop2', lat: 12.9279, lng: 77.6271 },
  ];
  const routeId = 'route123';

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('optimizes route and assigns sequence', async () => {
    axios.get.mockResolvedValue({
      data: {
        trips: [{
          geometry: { type: 'LineString', coordinates: [[77.5946,12.9716],[77.6245,12.9352],[77.6271,12.9279]] }
        }],
        waypoints: [
          { waypoint_index: 0, location: [77.5946,12.9716] }, // depot
          { waypoint_index: 1, location: [77.6245,12.9352] },
          { waypoint_index: 2, location: [77.6271,12.9279] },
        ]
      }
    });

    const result = await routingService.optimizeRoute({ depot, stops, routeId });

    expect(Route.update).toHaveBeenCalledWith(
      { optimized_geometry: { type: 'LineString', coordinates: [[77.5946,12.9716],[77.6245,12.9352],[77.6271,12.9279]] } },
      { where: { id: routeId } }
    );
    expect(Stop.update).toHaveBeenCalledTimes(2);
    expect(result.optimizedStops.length).toBe(2);
    expect(result.geometry.type).toBe('LineString');
  });

  it('handles OSRM errors gracefully', async () => {
    axios.get.mockRejectedValue(new Error('OSRM error'));
    await expect(routingService.optimizeRoute({ depot, stops, routeId }))
      .rejects.toThrow('Routing optimization failed');
  });

  it('throws error if no trips returned', async () => {
    axios.get.mockResolvedValue({ data: { trips: [] } });
    await expect(routingService.optimizeRoute({ depot, stops, routeId }))
      .rejects.toThrow('Routing optimization failed');
  });

  it('handles single stop', async () => {
    axios.get.mockResolvedValue({
      data: {
        trips: [{
          geometry: { type: 'LineString', coordinates: [[77.5946,12.9716],[77.6245,12.9352]] }
        }],
        waypoints: [
          { waypoint_index: 0, location: [77.5946,12.9716] }, // depot
          { waypoint_index: 1, location: [77.6245,12.9352] },
        ]
      }
    });

    const singleStop = [{ id: 'stop1', lat: 12.9352, lng: 77.6245 }];
    const result = await routingService.optimizeRoute({ depot, stops: singleStop, routeId });

    expect(result.optimizedStops.length).toBe(1);
    expect(result.optimizedStops[0].sequence_order).toBe(1);
  });

  it('throws error if stops array is empty', async () => {
    await expect(routingService.optimizeRoute({ depot, stops: [], routeId }))
      .rejects.toThrow('Routing optimization failed');
  });
});