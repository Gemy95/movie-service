import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MovieService } from '@App/modules/movie/movie.service';
import { MovieRepository } from '@App/modules/movie/repositories/movie.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly movieService: MovieService,
    private readonly movieRepository: MovieRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleSyncMoviesCron(): Promise<void> {
    this.logger.log('Starting movie synchronization job...');

    let page = 1;
    let totalPages = 1;

    try {
      do {
        const data = await this.movieService.findAll({ page });

        if (!data?.results?.length) {
          this.logger.warn(`No results found on page ${page}.`);
          break;
        }

        totalPages = data?.total_pages || 1;

        await this.movieRepository.upsertMany(data.results);
        await Promise.all(
          data.results.map(async (movie) => {
            this.cacheManager.set(`movie:${movie.id}`, { ...movie });
          })
        );
        this.logger.log(`Synced page ${page}/${totalPages} (${data.results.length} movies)`);

        page++;

        await this.delay(1000);
      } while (page <= totalPages);

      this.logger.log('Movie synchronization completed successfully.');
    } catch (error) {
      this.logger.error(`Movie synchronization failed: ${error.message}`);
    }
  }

  async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
