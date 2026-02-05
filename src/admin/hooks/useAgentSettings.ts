import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AgentSettings {
  capture_interval_minutes: string;
  rewrite_interval_minutes: string;
  max_rewrites_per_run: string;
  agent_enabled: string;
  auto_rewrite_enabled: string;
  duplicate_threshold: string;
}

const DEFAULT_SETTINGS: AgentSettings = {
  capture_interval_minutes: '5',
  rewrite_interval_minutes: '2',
  max_rewrites_per_run: '3',
  agent_enabled: 'true',
  auto_rewrite_enabled: 'true',
  duplicate_threshold: '0.85',
};

export function useAgentSettings() {
  return useQuery({
    queryKey: ['agent-settings'],
    queryFn: async (): Promise<AgentSettings> => {
      const { data, error } = await supabase
        .from('agent_settings')
        .select('key, value');
      
      if (error) {
        console.error('Error fetching agent settings:', error);
        return DEFAULT_SETTINGS;
      }
      
      // Convert array to key-value map
      const settings = data.reduce((acc, item) => {
        acc[item.key as keyof AgentSettings] = item.value;
        return acc;
      }, {} as AgentSettings);
      
      // Merge with defaults in case some settings are missing
      return { ...DEFAULT_SETTINGS, ...settings };
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useUpdateAgentSetting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from('agent_settings')
        .update({ 
          value, 
          updated_at: new Date().toISOString() 
        })
        .eq('key', key);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-settings'] });
      toast.success('Configuração guardada');
    },
    onError: (error) => {
      console.error('Error updating setting:', error);
      toast.error('Erro ao guardar configuração');
    },
  });
}

export function useSaveAllAgentSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: Partial<AgentSettings>) => {
      const updates = Object.entries(settings).map(([key, value]) =>
        supabase
          .from('agent_settings')
          .update({ 
            value, 
            updated_at: new Date().toISOString() 
          })
          .eq('key', key)
      );
      
      const results = await Promise.all(updates);
      const errors = results.filter(r => r.error);
      
      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} settings`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-settings'] });
      toast.success('Definições guardadas com sucesso');
    },
    onError: (error) => {
      console.error('Error saving settings:', error);
      toast.error('Erro ao guardar definições');
    },
  });
}
