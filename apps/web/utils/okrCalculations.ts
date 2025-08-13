export interface OKRData {
  current_value: number | null;
  // New field names from v_okr_performance
  target_value?: number | null;
  status?: string;
  // Backward compatibility
  metric_target_value?: number | null;
  time_progress_percent?: number;
  performance_status?: string;
}

export interface OKRStatus {
  progress_percentage: number;
  status: string;
  health: 'green' | 'yellow' | 'red' | 'gray';
}

export const calculateOKRStatus = (okr: OKRData): OKRStatus => {
  const { current_value, time_progress_percent } = okr;
  const metric_target_value = okr.target_value || okr.metric_target_value;
  const initialStatus = okr.status || okr.performance_status;

  if (initialStatus === "Target Achieved" || initialStatus === "Completed") {
    return {
      progress_percentage: 100,
      status: "Target Achieved",
      health: "green"
    };
  }
  
  if (initialStatus === "Not Started") {
    return {
      progress_percentage: 0,
      status: "Not Started",
      health: "gray"
    };
  }

  const progress_percentage = (metric_target_value && metric_target_value !== 0 && current_value !== null) 
    ? (current_value / metric_target_value) * 100 
    : 0;
  let status = initialStatus;
  let health: 'green' | 'yellow' | 'red' | 'gray' = "gray";

  // Determine health based on progress percentage
  if (progress_percentage >= 80) {
    health = "green";
  } else if (progress_percentage >= 60) {
    health = "yellow"; 
  } else if (progress_percentage >= 40) {
    health = "yellow";
  } else {
    health = "red";
  }

  // Override health based on performance_status from DB
  if (initialStatus === "At Risk") health = "red";
  if (initialStatus === "Behind") health = "yellow";
  if (initialStatus === "On Track") health = "green";

  return {
    progress_percentage: parseFloat(progress_percentage.toFixed(2)),
    status,
    health
  };
};

export const getHealthColor = (health: string): string => {
  switch (health) {
    case 'green':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'yellow':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'red':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'gray':
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export const getHealthLabel = (health: string): string => {
  switch (health) {
    case 'green':
      return 'Excellent';
    case 'yellow':
      return 'Good';
    case 'red':
      return 'At Risk';
    case 'gray':
    default:
      return 'N/A';
  }
};

export const getProgressColor = (progress: number): string => {
  if (progress >= 80) return '#10b981'; // green-500
  if (progress >= 60) return '#3b82f6'; // blue-500
  if (progress >= 40) return '#f59e0b'; // amber-500
  return '#ef4444'; // red-500
};