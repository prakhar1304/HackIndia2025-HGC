/**
 * MeTTa API Queue Manager
 * Ensures only one MeTTa call happens at a time to prevent conflicts
 */

interface QueueItem {
  id: string;
  fn: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timestamp: number;
}

class MeTTaQueue {
  private queue: QueueItem[] = [];
  private isProcessing = false;
  private readonly DELAY_BETWEEN_CALLS = 1000; // 1 second delay between MeTTa calls

  async add<T>(id: string, apiCall: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const queueItem: QueueItem = {
        id,
        fn: apiCall,
        resolve,
        reject,
        timestamp: Date.now()
      };

      console.log(`📋 Adding MeTTa API call to queue: ${id}`);
      this.queue.push(queueItem);
      
      // Start processing if not already running
      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log(`🔄 Processing MeTTa queue (${this.queue.length} items)`);

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) continue;

      try {
        console.log(`⚡ Executing MeTTa API call: ${item.id}`);
        const result = await item.fn();
        console.log(`✅ MeTTa API call completed: ${item.id}`);
        item.resolve(result);
      } catch (error) {
        console.error(`❌ MeTTa API call failed: ${item.id}`, error);
        item.reject(error);
      }

      // Add delay between calls to prevent MeTTa conflicts
      if (this.queue.length > 0) {
        console.log(`⏳ Waiting ${this.DELAY_BETWEEN_CALLS}ms before next MeTTa call...`);
        await new Promise(resolve => setTimeout(resolve, this.DELAY_BETWEEN_CALLS));
      }
    }

    this.isProcessing = false;
    console.log(`🏁 MeTTa queue processing complete`);
  }

  getQueueStatus() {
    return {
      isProcessing: this.isProcessing,
      queueLength: this.queue.length,
      queueIds: this.queue.map(item => item.id)
    };
  }

  clearQueue() {
    const clearedItems = this.queue.length;
    this.queue.forEach(item => {
      item.reject(new Error('Queue cleared'));
    });
    this.queue = [];
    console.log(`🗑️ Cleared ${clearedItems} items from MeTTa queue`);
  }
}

// Export singleton instance
export const mettaQueue = new MeTTaQueue();

// Helper function to create queue-safe API calls
export function createMettaApiCall<T>(
  id: string, 
  apiCall: () => Promise<T>
): () => Promise<T> {
  return () => mettaQueue.add(id, apiCall);
}
