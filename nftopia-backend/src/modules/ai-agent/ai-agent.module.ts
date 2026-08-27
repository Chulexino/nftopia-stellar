import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NftModule } from '../nft/nft.module';
import { ListingModule } from '../listing/listing.module';
import { CollectionModule } from '../collection/collection.module';
import { OrderModule } from '../order/order.module';
import { AiAgentService } from './ai-agent.service';
import { AiAgentController } from './ai-agent.controller';
import { AiUsageService } from './ai-usage.service';
import { AiAgentHealthService } from './ai-agent-health.service';
import { ChatSessionService } from './chat-session.service';
import { AiUsageRecord } from './entities/ai-usage-record.entity';
import { ChatSession } from './entities/chat-session.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { AiChatRateLimitGuard } from '../../common/guards/ai-chat-rate-limit.guard';
import { aiChatRateLimiterProvider } from '../../common/guards/ai-chat-rate-limiter.provider';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([AiUsageRecord, ChatSession, ChatMessage]),
    NftModule,
    ListingModule,
    CollectionModule,
    OrderModule,
  ],
  providers: [
    AiAgentService,
    AiUsageService,
    AiAgentHealthService,
    ChatSessionService,
    AiChatRateLimitGuard,
    aiChatRateLimiterProvider,
  ],
  controllers: [AiAgentController],
  exports: [AiAgentService, AiUsageService],
})
export class AiAgentModule {}
