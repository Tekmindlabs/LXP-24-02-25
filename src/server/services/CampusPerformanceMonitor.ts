import { PrismaClient } from "@prisma/client";
import { CampusLoggingService, LogLevel, LogCategory } from "./CampusLoggingService";
import { PerformanceMetrics, EndpointMetrics } from "../../types/campus";

export class CampusPerformanceMonitor {
	constructor(
		private readonly db: PrismaClient,
		private readonly logger: CampusLoggingService
	) {}

	async recordMetrics(campusId: string, metrics: Omit<PerformanceMetrics, 'id' | 'timestamp' | 'createdAt' | 'updatedAt'>) {
		await this.db.$executeRaw`
			INSERT INTO performance_metrics (
				campus_id, response_time, memory_usage, cpu_usage, active_users, timestamp
			) VALUES (
				${campusId}, ${metrics.responseTime}, ${metrics.memoryUsage}, 
				${metrics.cpuUsage}, ${metrics.activeUsers}, ${new Date()}
			)
		`;

		if (metrics.responseTime > 1000 || metrics.cpuUsage > 80) {
			await this.logger.log({
				level: LogLevel.WARNING,
				category: LogCategory.PERFORMANCE,
				message: 'Performance threshold exceeded',
				metadata: metrics,
				campusId
			});
		}
	}

	async recordEndpointMetrics(
		campusId: string,
		metrics: Omit<EndpointMetrics, 'id' | 'lastUpdated' | 'createdAt' | 'updatedAt'>
	) {
		await this.db.$executeRaw`
			INSERT INTO endpoint_metrics (
				campus_id, path, method, total_requests, average_response_time, error_rate, last_updated
			) VALUES (
				${campusId}, ${metrics.path}, ${metrics.method}, ${metrics.totalRequests},
				${metrics.averageResponseTime}, ${metrics.errorRate}, ${new Date()}
			)
			ON CONFLICT (campus_id, path, method) DO UPDATE SET
				total_requests = ${metrics.totalRequests},
				average_response_time = ${metrics.averageResponseTime},
				error_rate = ${metrics.errorRate},
				last_updated = ${new Date()}
		`;

		if (metrics.errorRate > 0.05) {
			await this.logger.log({
				level: LogLevel.WARNING,
				category: LogCategory.PERFORMANCE,
				message: 'High endpoint error rate detected',
				metadata: metrics,
				campusId
			});
		}
	}

	async getPerformanceMetrics(
		campusId: string,
		startDate: Date,
		endDate: Date
	): Promise<PerformanceMetrics[]> {
		return this.db.$queryRaw<PerformanceMetrics[]>`
			SELECT * FROM performance_metrics
			WHERE campus_id = ${campusId}
			AND timestamp >= ${startDate}
			AND timestamp <= ${endDate}
			ORDER BY timestamp DESC
		`;
	}

	async getEndpointMetrics(
		campusId: string,
		path?: string
	): Promise<EndpointMetrics[]> {
		if (path) {
			return this.db.$queryRaw<EndpointMetrics[]>`
				SELECT * FROM endpoint_metrics
				WHERE campus_id = ${campusId}
				AND path = ${path}
				ORDER BY error_rate DESC
			`;
		}
		return this.db.$queryRaw<EndpointMetrics[]>`
			SELECT * FROM endpoint_metrics
			WHERE campus_id = ${campusId}
			ORDER BY error_rate DESC
		`;
	}



	async generatePerformanceReport(
		campusId: string,
		startDate: Date,
		endDate: Date
	) {
		const [metrics, endpoints] = await Promise.all([
			this.getPerformanceMetrics(campusId, startDate, endDate),
			this.getEndpointMetrics(campusId)
		]);

		const averageMetrics = this.calculateAverageMetrics(metrics);
		const endpointAnalysis = this.analyzeEndpointMetrics(endpoints);

		return {
			period: { startDate, endDate },
			averageMetrics,
			endpointAnalysis,
			recommendations: this.generateRecommendations(averageMetrics, endpointAnalysis)
		};
	}

	private calculateAverageMetrics(metrics: PerformanceMetrics[]) {
		if (metrics.length === 0) return null;

		return {
			averageResponseTime: metrics.reduce((acc, m) => acc + m.responseTime, 0) / metrics.length,
			averageMemoryUsage: metrics.reduce((acc, m) => acc + m.memoryUsage, 0) / metrics.length,
			averageCpuUsage: metrics.reduce((acc, m) => acc + m.cpuUsage, 0) / metrics.length,
			peakActiveUsers: Math.max(...metrics.map(m => m.activeUsers))
		};
	}

	private analyzeEndpointMetrics(endpoints: EndpointMetrics[]) {
		return {
			totalEndpoints: endpoints.length,
			highErrorEndpoints: endpoints.filter(e => e.errorRate > 0.05),
			slowEndpoints: endpoints.filter(e => e.averageResponseTime > 1000)
		};
	}

	private generateRecommendations(
		averageMetrics: any,
		endpointAnalysis: any
	) {
		const recommendations = [];

		if (averageMetrics?.averageResponseTime > 1000) {
			recommendations.push('Consider optimizing database queries and implementing caching');
		}

		if (averageMetrics?.averageCpuUsage > 70) {
			recommendations.push('Monitor server resources and consider scaling if trend continues');
		}

		if (endpointAnalysis.highErrorEndpoints.length > 0) {
			recommendations.push('Investigate and fix endpoints with high error rates');
		}

		return recommendations;
	}
}