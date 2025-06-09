/**
 * S3 Storage Service Test Suite
 * Comprehensive test suite for S3 caching functionality
 * 
 * This file serves as the main entry point for all S3-related tests.
 * Individual test files are organized by functionality:
 * 
 * - configuration.test.js: Service setup and environment validation
 * - error-handling.test.js: Error scenarios and failure modes
 * - data-processing.test.js: Data transformation and validation
 * - list-operations.test.js: Artist listing and bucket operations
 * - connection.test.js: Connection testing and availability checks
 * - key-generation.test.js: S3 key formatting and naming conventions
 */

import './configuration.test.js';
import './error-handling.test.js';
import './data-processing.test.js';
import './list-operations.test.js';
import './connection.test.js';
import './key-generation.test.js';
