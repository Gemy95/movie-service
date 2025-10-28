import { MovieModule } from '@App/modules/movie/movie.module';
import { SyncService } from '@App/modules/sync/sync.service';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

@Module({
  imports: [HttpModule, MovieModule],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
