import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { NftModule } from '../nft/nft.module';
import { ListingModule } from '../listing/listing.module';
import { CollectionModule } from '../collection/collection.module';
import { AiAgentService } from './ai-agent.service';
import { AiAgentController } from './ai-agent.controller';
import { AiUsageService } from './ai-usage.service';
import { AiAgentHealthService } from './ai-agent-health.service';
import { AiUsageRecord } from './entities/ai-usage-record.entity';
import { AiChatRateLimitGuard } from '../../common/guards/ai-chat-rate-limit.guard';
import { aiChatRateLimiterProvider } from '../../common/guards/ai-chat-rate-limiter.provider';
import { ListingCreatedListener } from './listeners/listing-created.listener';
import { AI_MODERATION_QUEUE_NAME } from './listeners/ai-moderation.types';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([AiUsageRecord]),
    BullModule.registerQueue({ name: AI_MODERATION_QUEUE_NAME }),
    NftModule,
    ListingModule,
    CollectionModule,
  ],
  providers: [
    AiAgentService,
    AiUsageService,
    AiAgentHealthService,
    AiChatRateLimitGuard,
    aiChatRateLimiterProvider,
    ListingCreatedListener,
  ],
  controllers: [AiAgentController],
  exports: [AiAgentService, AiUsageService],
})
export class AiAgentModule {}
