/**
 * Modelo para estadísticas del Dashboard
 */
export interface DashboardStats {
  totalConversations: number;
  activeChannels: number;
  totalFlows: number;
  documentsProcessed: number;
}

/**
 * Modelo para datos de gráficos
 */
export interface ChartDataset {
  label: string;
  data: number[];
  fill?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  tension?: number;
  pointBackgroundColor?: string;
  pointBorderColor?: string;
  pointBorderWidth?: number;
  pointRadius?: number;
  pointHoverRadius?: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

/**
 * Modelo para opciones de gráficos
 */
export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins?: Record<string, unknown>;
  scales?: Record<string, unknown>;
}

/**
 * Modelo para actividad reciente
 */
export interface ActivityItem {
  id: string;
  title: string;
  meta: string;
  icon: string;
  type: 'success' | 'info' | 'warning' | 'primary';
}

/**
 * Modelo principal del Dashboard
 */
export interface DashboardData {
  stats: DashboardStats;
  conversationsData: ChartData;
  chartOptions: ChartOptions;
  activityItems?: ActivityItem[];
}
