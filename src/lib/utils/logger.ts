// src/lib/utils/logger.ts

// Sistema de logging detalhado para desenvolvimento e produção

// Níveis de log
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    CRITICAL = 4
  }
  
  // Interface para entradas de log
  export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    data?: any;
    stack?: string;
    component?: string;
    user?: string;
    sessionId?: string;
    url?: string;
    userAgent?: string;
  }
  
  // Configuração do logger
  interface LoggerConfig {
    level: LogLevel;
    enableConsole: boolean;
    enableStorage: boolean;
    maxStorageEntries: number;
    enableRemoteLogging: boolean;
    remoteEndpoint?: string;
    enablePerformanceLogging: boolean;
  }
  
  // Configuração padrão
  const defaultConfig: LoggerConfig = {
    level: LogLevel.INFO,
    enableConsole: true,
    enableStorage: false, // Desabilitado por padrão devido às limitações do localStorage
    maxStorageEntries: 1000,
    enableRemoteLogging: false,
    enablePerformanceLogging: true
  };
  
  // Classe principal do logger
  class Logger {
    private config: LoggerConfig;
    private sessionId: string;
    private logStorage: LogEntry[] = [];
  
    constructor(config: Partial<LoggerConfig> = {}) {
      this.config = { ...defaultConfig, ...config };
      this.sessionId = this.generateSessionId();
      
      // Configurar nível baseado no ambiente
      if (typeof window !== 'undefined') {
        const isDev = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
        
        if (isDev) {
          this.config.level = LogLevel.DEBUG;
        }
      }
    }
  
    // Gerar ID da sessão
    private generateSessionId(): string {
      return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  
    // Método principal de log
    private log(level: LogLevel, message: string, data?: any, component?: string): void {
      if (level < this.config.level) return;
  
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        data,
        component,
        sessionId: this.sessionId,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
      };
  
      // Adicionar stack trace para erros
      if (level >= LogLevel.ERROR) {
        entry.stack = new Error().stack;
      }
  
      // Log no console
      if (this.config.enableConsole) {
        this.logToConsole(entry);
      }
  
      // Armazenar em memória
      if (this.config.enableStorage) {
        this.logToStorage(entry);
      }
  
      // Enviar para servidor remoto
      if (this.config.enableRemoteLogging && level >= LogLevel.ERROR) {
        this.logToRemote(entry);
      }
    }
  
    // Log no console com formatação
    private logToConsole(entry: LogEntry): void {
      const { timestamp, level, message, data, component } = entry;
      const timeStr = new Date(timestamp).toLocaleTimeString();
      const levelStr = LogLevel[level].padEnd(8);
      const componentStr = component ? `[${component}]` : '';
      
      const logMessage = `${timeStr} ${levelStr} ${componentStr} ${message}`;
  
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(logMessage, data);
          break;
        case LogLevel.INFO:
          console.info(logMessage, data);
          break;
        case LogLevel.WARN:
          console.warn(logMessage, data);
          break;
        case LogLevel.ERROR:
        case LogLevel.CRITICAL:
          console.error(logMessage, data);
          if (entry.stack) {
            console.error(entry.stack);
          }
          break;
      }
    }
  
    // Armazenar logs em memória (limitado)
    private logToStorage(entry: LogEntry): void {
      this.logStorage.push(entry);
      
      // Manter apenas o número máximo de entradas
      if (this.logStorage.length > this.config.maxStorageEntries) {
        this.logStorage.shift();
      }
    }
  
    // Enviar logs para servidor remoto
    private async logToRemote(entry: LogEntry): Promise<void> {
      if (!this.config.remoteEndpoint) return;
  
      try {
        await fetch(this.config.remoteEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(entry)
        });
      } catch (error) {
        // Falha silenciosa para não criar loop de logging
        console.error('Failed to send log to remote endpoint:', error);
      }
    }
  
    // Métodos públicos de log
    debug(message: string, data?: any, component?: string): void {
      this.log(LogLevel.DEBUG, message, data, component);
    }
  
    info(message: string, data?: any, component?: string): void {
      this.log(LogLevel.INFO, message, data, component);
    }
  
    warn(message: string, data?: any, component?: string): void {
      this.log(LogLevel.WARN, message, data, component);
    }
  
    error(message: string, error?: Error | any, component?: string): void {
      const errorData = error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error;
      
      this.log(LogLevel.ERROR, message, errorData, component);
    }
  
    critical(message: string, error?: Error | any, component?: string): void {
      const errorData = error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error;
      
      this.log(LogLevel.CRITICAL, message, errorData, component);
    }
  
    // Logging de performance
    performance(label: string, startTime: number, data?: any, component?: string): void {
      if (!this.config.enablePerformanceLogging) return;
      
      const duration = performance.now() - startTime;
      this.info(`Performance: ${label} took ${duration.toFixed(2)}ms`, { duration, ...data }, component);
    }
  
    // Método para medir performance automaticamente
    time<T>(label: string, fn: () => T | Promise<T>, component?: string): T | Promise<T> {
      const startTime = performance.now();
      
      try {
        const result = fn();
        
        if (result instanceof Promise) {
          return result
            .then(value => {
              this.performance(label, startTime, undefined, component);
              return value;
            })
            .catch(error => {
              this.performance(label, startTime, { error: true }, component);
              throw error;
            });
        } else {
          this.performance(label, startTime, undefined, component);
          return result;
        }
      } catch (error) {
        this.performance(label, startTime, { error: true }, component);
        throw error;
      }
    }
  
    // Utilitários de logging
    group(label: string): void {
      if (this.config.enableConsole) {
        console.group(label);
      }
    }
  
    groupEnd(): void {
      if (this.config.enableConsole) {
        console.groupEnd();
      }
    }
  
    table(data: any, component?: string): void {
      if (this.config.enableConsole && this.config.level <= LogLevel.DEBUG) {
        console.table(data);
      }
      this.debug('Table data logged', data, component);
    }
  
    // Obter logs armazenados
    getLogs(level?: LogLevel): LogEntry[] {
      if (level !== undefined) {
        return this.logStorage.filter(entry => entry.level >= level);
      }
      return [...this.logStorage];
    }
  
    // Limpar logs armazenados
    clearLogs(): void {
      this.logStorage = [];
    }
  
    // Exportar logs como JSON
    exportLogs(): string {
      return JSON.stringify(this.logStorage, null, 2);
    }
  
    // Configurar logger
    configure(config: Partial<LoggerConfig>): void {
      this.config = { ...this.config, ...config };
    }
  
    // Obter estatísticas dos logs
    getStats(): {
      totalLogs: number;
      byLevel: Record<string, number>;
      byComponent: Record<string, number>;
      sessionId: string;
    } {
      const byLevel: Record<string, number> = {};
      const byComponent: Record<string, number> = {};
  
      this.logStorage.forEach(entry => {
        const levelName = LogLevel[entry.level];
        byLevel[levelName] = (byLevel[levelName] || 0) + 1;
  
        if (entry.component) {
          byComponent[entry.component] = (byComponent[entry.component] || 0) + 1;
        }
      });
  
      return {
        totalLogs: this.logStorage.length,
        byLevel,
        byComponent,
        sessionId: this.sessionId
      };
    }
  }
  
  // Instância global do logger
  export const logger = new Logger();
  
  // Wrapper para logging de API calls
  export const apiLogger = {
    request(method: string, url: string, data?: any): void {
      logger.debug(`API Request: ${method} ${url}`, { method, url, data }, 'API');
    },
  
    response(method: string, url: string, status: number, data?: any, duration?: number): void {
      const message = `API Response: ${method} ${url} - ${status}`;
      const logData = { method, url, status, data, duration };
      
      if (status >= 400) {
        logger.error(message, logData, 'API');
      } else {
        logger.info(message, logData, 'API');
      }
    },
  
    error(method: string, url: string, error: Error): void {
      logger.error(`API Error: ${method} ${url}`, {
        method,
        url,
        error: error.message,
        stack: error.stack
      }, 'API');
    }
  };
  
  // Wrapper para logging de componentes
  export const componentLogger = {
    mount(componentName: string, props?: any): void {
      logger.debug(`Component mounted: ${componentName}`, props, componentName);
    },
  
    unmount(componentName: string): void {
      logger.debug(`Component unmounted: ${componentName}`, undefined, componentName);
    },
  
    action(componentName: string, action: string, data?: any): void {
      logger.debug(`Component action: ${componentName}.${action}`, data, componentName);
    },
  
    error(componentName: string, error: Error, context?: any): void {
      logger.error(`Component error: ${componentName}`, {
        error: error.message,
        stack: error.stack,
        context
      }, componentName);
    }
  };
  
  // Wrapper para logging de navegação
  export const navigationLogger = {
    navigate(from: string, to: string): void {
      logger.info(`Navigation: ${from} -> ${to}`, { from, to }, 'Navigation');
    },
  
    error(error: Error, route?: string): void {
      logger.error('Navigation error', {
        error: error.message,
        route,
        stack: error.stack
      }, 'Navigation');
    }
  };
  
  // Interceptar erros globais
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      logger.critical('Uncaught Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      }, 'Global');
    });
  
    window.addEventListener('unhandledrejection', (event) => {
      logger.critical('Unhandled Promise Rejection', {
        reason: event.reason,
        promise: event.promise
      }, 'Global');
    });
  }
  
  // Função utilitária para logging condicional
  export function logIf(condition: boolean, level: keyof typeof logger, message: string, data?: any, component?: string): void {
    if (condition && typeof logger[level] === 'function') {
      (logger[level] as any)(message, data, component);
    }
  }
  
  // Decorador para logging automático de métodos (se usando decorators)
  export function logged(component?: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;
  
      descriptor.value = function (...args: any[]) {
        const startTime = performance.now();
        const methodName = `${target.constructor.name}.${propertyKey}`;
        
        logger.debug(`Method called: ${methodName}`, { args }, component);
  
        try {
          const result = originalMethod.apply(this, args);
          
          if (result instanceof Promise) {
            return result
              .then(value => {
                logger.performance(methodName, startTime, undefined, component);
                return value;
              })
              .catch(error => {
                logger.error(`Method error: ${methodName}`, error, component);
                throw error;
              });
          } else {
            logger.performance(methodName, startTime, undefined, component);
            return result;
          }
        } catch (error) {
          logger.error(`Method error: ${methodName}`, error, component);
          throw error;
        }
      };
  
      return descriptor;
    };
  }