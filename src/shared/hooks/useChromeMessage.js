import { useEffect } from 'react';

/**
 * useChromeMessage — subscribes to chrome.runtime.onMessage in a React component.
 *
 * Usage:
 *   useChromeMessage((msg) => {
 *     if (msg.type === 'PROBLEM_SOLVED') refetch();
 *   });
 */
export function useChromeMessage(handler) {
  useEffect(() => {
    const isChromeExtension = typeof chrome !== 'undefined' && chrome.runtime?.onMessage;
    if (!isChromeExtension) return;

    const wrapped = (message, sender, sendResponse) => {
      handler(message, sender, sendResponse);
    };

    chrome.runtime.onMessage.addListener(wrapped);
    return () => chrome.runtime.onMessage.removeListener(wrapped);
  }, [handler]);
}
