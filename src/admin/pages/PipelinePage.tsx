import { AdminLayout } from '../components/layout/AdminLayout';
import { PipelineBoard } from '../components/pipeline/PipelineBoard';
import { Workflow } from 'lucide-react';

export default function PipelinePage() {
  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Workflow className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Pipeline Editorial</h1>
              <p className="text-sm text-muted-foreground">
                Acompanhe o fluxo de artigos em tempo real
              </p>
            </div>
          </div>
        </div>

        {/* Pipeline Board */}
        <PipelineBoard />
      </div>
    </AdminLayout>
  );
}
