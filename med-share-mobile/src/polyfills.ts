import 'react-native-get-random-values';
import { Buffer } from 'buffer';

// Polyfill Buffer
if (typeof global.Buffer === 'undefined') {
    (global as any).Buffer = Buffer;
}

// Polyfill Process
if (typeof global.process === 'undefined') {
    (global as any).process = { env: {} };
}