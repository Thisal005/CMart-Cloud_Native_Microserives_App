import { Router, Request, Response } from 'express';
import { Logger } from '../logging';

export interface DependencyCheck {
  name: string;
  check: () => Promise<{ status: 'UP' | 'DOWN'; details?: any }>;
}

export const createMonitoringRouter = (
  serviceName: string,
  dependencies: DependencyCheck[] = []
): Router => {
  const router = Router();
  const logger = new Logger(serviceName);

  // App version can be read from env or fallback
  const appVersion = process.env.APP_VERSION || '1.0.0';
  const gitCommit = process.env.GIT_COMMIT || 'unknown';
  const buildTimestamp = process.env.BUILD_TIMESTAMP || new Date().toISOString();

  /**
   * GET /health
   * Simple liveness check - quickly verifies the node process is alive.
   */
  router.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'UP',
      service: serviceName,
      version: appVersion,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * GET /ready
   * Readiness check - validates database connection and external integrations.
   */
  router.get('/ready', async (req: Request, res: Response) => {
    const checksResults: Record<string, { status: 'UP' | 'DOWN'; details?: any }> = {};
    let allHealthy = true;

    await Promise.all(
      dependencies.map(async (dep) => {
        try {
          const result = await dep.check();
          checksResults[dep.name] = result;
          if (result.status === 'DOWN') {
            allHealthy = false;
          }
        } catch (error: any) {
          allHealthy = false;
          checksResults[dep.name] = {
            status: 'DOWN',
            details: { error: error.message || 'Unknown check error' },
          };
          logger.error(`Readiness check failed for dependency: ${dep.name}`, error, { serviceName });
        }
      })
    );

    const statusCode = allHealthy ? 200 : 503;
    const responsePayload = {
      status: allHealthy ? 'UP' : 'DOWN',
      service: serviceName,
      timestamp: new Date().toISOString(),
      checks: checksResults,
    };

    if (!allHealthy) {
      logger.warn(`Readiness check returned DOWN for ${serviceName}`, responsePayload);
    }

    res.status(statusCode).json(responsePayload);
  });

  /**
   * GET /version
   * Outputs application build and environment metadata.
   */
  router.get('/version', (req: Request, res: Response) => {
    res.json({
      service: serviceName,
      version: appVersion,
      gitCommit,
      buildTimestamp,
      runtime: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        env: process.env.NODE_ENV || 'development',
      },
    });
  });

  return router;
};
