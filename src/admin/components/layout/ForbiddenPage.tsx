 import { Button } from '@/components/ui/button';
 import { ShieldX, LogIn } from 'lucide-react';
 import { useNavigate } from 'react-router-dom';
 
 interface ForbiddenPageProps {
   message?: string;
   showLogin?: boolean;
 }
 
 export function ForbiddenPage({ 
   message = 'Não tem permissões para aceder a esta página.', 
   showLogin = true 
 }: ForbiddenPageProps) {
   const navigate = useNavigate();
 
   return (
     <div className="flex h-screen w-screen items-center justify-center bg-background">
       <div className="flex flex-col items-center gap-6 text-center max-w-md px-4">
         <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
           <ShieldX className="h-10 w-10 text-destructive" />
         </div>
         <div className="space-y-2">
           <h1 className="text-2xl font-bold text-foreground">Acesso Negado</h1>
           <p className="text-muted-foreground">{message}</p>
         </div>
         <div className="flex gap-3">
           {showLogin && (
             <Button onClick={() => navigate('/admin/login')} className="gap-2">
               <LogIn className="h-4 w-4" />
               Iniciar Sessão
             </Button>
           )}
           <Button variant="outline" onClick={() => navigate('/')}>
             Voltar ao Início
           </Button>
         </div>
       </div>
     </div>
   );
 }