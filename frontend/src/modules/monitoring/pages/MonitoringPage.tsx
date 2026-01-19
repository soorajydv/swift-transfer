import { useState, useEffect } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import { StatCard } from '@/shared/components/StatCard';
import { Button } from '@/shared/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/card';
import { Badge } from '@/shared/components/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/tabs';
import { Progress } from '@/shared/components/progress';
import { Activity, Database, HardDrive, MessageSquare, RefreshCw, Server, CheckCircle, AlertTriangle, XCircle, Zap, Users, MessageCircle, TrendingUp } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import api from '@/shared/lib/api';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'error';
  services: {
    database: boolean;
    redis: boolean;
    kafka: boolean;
  };
  uptime: number;
  timestamp: string;
}

interface RedisStats {
  connected: boolean;
  memory?: {
    used: number;
    peak: number;
    fragmentation: number;
  };
  keys?: {
    total: number;
    expired: number;
  };
  connections?: {
    active: number;
    total: number;
  };
  operations?: {
    commands_processed: number;
    hits: number;
    misses: number;
  };
}

interface KafkaStats {
  connected: boolean;
  brokers?: number;
  topics?: number;
  consumer_groups?: number;
  partitions?: number;
  messages?: {
    produced: number;
    consumed: number;
  };
}

interface DatabaseStats {
  connected: boolean;
  tables?: {
    total: number;
    names: string[];
  };
  records?: {
    total: number;
    byTable: Record<string, number>;
  };
  performance?: {
    queryCount: number;
    slowQueries: number;
  };
}

export default function MonitoringPage() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [redisStats, setRedisStats] = useState<RedisStats | null>(null);
  const [kafkaStats, setKafkaStats] = useState<KafkaStats | null>(null);
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchStats = async () => {
    setRefreshing(true);
    try {
      const [healthRes, redisRes, kafkaRes, dbRes] = await Promise.all([
        api.get('/api/monitoring/health'),
        api.get('/api/monitoring/redis'),
        api.get('/api/monitoring/kafka'),
        api.get('/api/monitoring/database')
      ]);

      setSystemHealth(healthRes.data.data);
      setRedisStats(redisRes.data.data);
      setKafkaStats(kafkaRes.data.data);
      setDatabaseStats(dbRes.data.data);
    } catch (error) {
      toast({
        title: 'Failed to fetch monitoring data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusBadge = (status: 'healthy' | 'warning' | 'error') => {
    const variants = {
      healthy: { variant: 'default' as const, icon: CheckCircle, text: 'Healthy' },
      warning: { variant: 'secondary' as const, icon: AlertTriangle, text: 'Warning' },
      error: { variant: 'destructive' as const, icon: XCircle, text: 'Error' },
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const getServiceStatus = (isConnected: boolean) => {
    return isConnected ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="System Monitoring" description="Monitor Redis and Kafka services" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading monitoring data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <PageHeader title="System Monitoring" description="Monitor Redis, Kafka, and database services" />
        <Button
          onClick={fetchStats}
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* System Health Overview */}
      {systemHealth && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="System Status"
            value={systemHealth.status}
            icon={Server}
            variant={systemHealth.status === 'healthy' ? 'success' : 'warning'}
          />
          <StatCard
            title="Uptime"
            value={formatUptime(systemHealth.uptime)}
            icon={Activity}
          />
          <StatCard
            title="Database"
            value={systemHealth.services.database ? 'Connected' : 'Disconnected'}
            icon={Database}
            variant={systemHealth.services.database ? 'success' : 'warning'}
          />
          <StatCard
            title="Services Online"
            value={`${Object.values(systemHealth.services).filter(Boolean).length}/3`}
            icon={Zap}
          />
        </div>
      )}

      <Tabs defaultValue="redis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="redis">Redis</TabsTrigger>
          <TabsTrigger value="kafka">Kafka</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
        </TabsList>

        {/* Redis Stats */}
        <TabsContent value="redis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Connection Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getServiceStatus(redisStats?.connected || false)}
                  Connection Status
                </CardTitle>
                <CardDescription>Redis connection and basic info</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Status:</span>
                  <Badge variant={redisStats?.connected ? 'default' : 'destructive'}>
                    {redisStats?.connected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
                {redisStats?.connected && (
                  <>
                    <div className="flex justify-between items-center">
                      <span>Active Connections:</span>
                      <span className="font-medium">{redisStats.connections?.active || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Keys:</span>
                      <span className="font-medium">{redisStats.keys?.total || 0}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Memory Usage */}
            {redisStats?.memory && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4" />
                    Memory Usage
                  </CardTitle>
                  <CardDescription>Redis memory statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Used Memory</span>
                      <span>{formatBytes(redisStats.memory.used)}</span>
                    </div>
                    <Progress value={Math.min((redisStats.memory.used / (redisStats.memory.used + 1000000)) * 100, 100)} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Fragmentation Ratio:</span>
                    <span className="font-medium">{redisStats.memory.fragmentation.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Operations */}
            {redisStats?.operations && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Operations
                  </CardTitle>
                  <CardDescription>Redis command statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{redisStats.operations.commands_processed.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Commands</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{redisStats.operations.hits.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Cache Hits</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{redisStats.operations.misses.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Cache Misses</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {redisStats.operations.commands_processed > 0
                          ? ((redisStats.operations.hits / (redisStats.operations.hits + redisStats.operations.misses)) * 100).toFixed(1)
                          : 0}%
                      </div>
                      <div className="text-sm text-muted-foreground">Hit Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Kafka Stats */}
        <TabsContent value="kafka" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Connection Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getServiceStatus(kafkaStats?.connected || false)}
                  Connection Status
                </CardTitle>
                <CardDescription>Kafka connection and cluster info</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Status:</span>
                  <Badge variant={kafkaStats?.connected ? 'default' : 'destructive'}>
                    {kafkaStats?.connected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
                {kafkaStats?.connected && (
                  <>
                    <div className="flex justify-between items-center">
                      <span>Brokers:</span>
                      <span className="font-medium">{kafkaStats.brokers || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Topics:</span>
                      <span className="font-medium">{kafkaStats.topics || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Consumer Groups:</span>
                      <span className="font-medium">{kafkaStats.consumer_groups || 0}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Message Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Messages
                </CardTitle>
                <CardDescription>Message production and consumption</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{kafkaStats?.messages?.produced.toLocaleString() || 0}</div>
                    <div className="text-sm text-muted-foreground">Produced</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{kafkaStats?.messages?.consumed.toLocaleString() || 0}</div>
                    <div className="text-sm text-muted-foreground">Consumed</div>
                  </div>
                </div>
                <div className="text-center text-sm text-muted-foreground mt-4">
                  Real-time monitoring requires additional tools like Burrow
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Database Stats */}
        <TabsContent value="database" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Connection Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getServiceStatus(databaseStats?.connected || false)}
                  Connection Status
                </CardTitle>
                <CardDescription>Database connection and schema info</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Status:</span>
                  <Badge variant={databaseStats?.connected ? 'default' : 'destructive'}>
                    {databaseStats?.connected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
                {databaseStats?.connected && (
                  <>
                    <div className="flex justify-between items-center">
                      <span>Total Tables:</span>
                      <span className="font-medium">{databaseStats.tables?.total || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Records:</span>
                      <span className="font-medium">{databaseStats.records?.total.toLocaleString() || 0}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Table Breakdown */}
            {databaseStats?.records?.byTable && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Records by Table
                  </CardTitle>
                  <CardDescription>Record count distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(databaseStats.records.byTable).map(([table, count]) => (
                      <div key={table} className="flex justify-between items-center">
                        <span className="capitalize">{table}</span>
                        <Badge variant="outline">{count.toLocaleString()}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
