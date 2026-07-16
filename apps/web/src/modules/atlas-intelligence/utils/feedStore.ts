import type { FeedItem } from "../types";

type Listener = (items: FeedItem[]) => void;

const MAX_FEED = 40;
let items: FeedItem[] = [];
const listeners = new Set<Listener>();

function notify(): void {
  for (const listener of listeners) {
    listener(items);
  }
}

export function getFeedItems(): FeedItem[] {
  return items;
}

export function prependFeedItems(next: FeedItem[]): void {
  if (next.length === 0) return;
  items = [...next, ...items].slice(0, MAX_FEED);
  notify();
}

export function clearFeed(): void {
  items = [];
  notify();
}

export function subscribeFeed(listener: Listener): () => void {
  listeners.add(listener);
  queueMicrotask(() => listener(items));
  return () => listeners.delete(listener);
}
