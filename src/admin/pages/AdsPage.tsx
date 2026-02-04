import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Plus, Megaphone, Pencil, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AdminLayout } from '../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { SponsoredCampaign, SponsoredAd } from '../types/admin';

export default function AdsPage() {
  const [campaigns, setCampaigns] = useState<SponsoredCampaign[]>([]);
  const [ads, setAds] = useState<(SponsoredAd & { campaign?: SponsoredCampaign })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Campaign form
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<SponsoredCampaign | null>(null);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    advertiser: '',
    start_date: '',
    end_date: '',
    is_active: true,
  });

  // Ad form
  const [adDialogOpen, setAdDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<SponsoredAd | null>(null);
  const [adForm, setAdForm] = useState({
    campaign_id: '',
    title: '',
    description: '',
    image_url: '',
    link: '',
    placement: 'feed' as 'feed' | 'hero' | 'sidebar',
    frequency: 8,
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    
    const [campaignsRes, adsRes] = await Promise.all([
      supabase
        .from('sponsored_campaigns')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('sponsored_ads')
        .select(`*, campaign:sponsored_campaigns(*)`)
        .order('created_at', { ascending: false }),
    ]);

    if (campaignsRes.data) setCampaigns(campaignsRes.data as SponsoredCampaign[]);
    if (adsRes.data) setAds(adsRes.data as (SponsoredAd & { campaign?: SponsoredCampaign })[]);
    
    setIsLoading(false);
  };

  // Campaign handlers
  const openCampaignDialog = (campaign?: SponsoredCampaign) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setCampaignForm({
        name: campaign.name,
        advertiser: campaign.advertiser,
        start_date: campaign.start_date || '',
        end_date: campaign.end_date || '',
        is_active: campaign.is_active,
      });
    } else {
      setEditingCampaign(null);
      setCampaignForm({
        name: '',
        advertiser: '',
        start_date: '',
        end_date: '',
        is_active: true,
      });
    }
    setCampaignDialogOpen(true);
  };

  const saveCampaign = async () => {
    if (!campaignForm.name || !campaignForm.advertiser) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsSaving(true);
    
    const data = {
      name: campaignForm.name,
      advertiser: campaignForm.advertiser,
      start_date: campaignForm.start_date || null,
      end_date: campaignForm.end_date || null,
      is_active: campaignForm.is_active,
    };

    if (editingCampaign) {
      const { error } = await supabase
        .from('sponsored_campaigns')
        .update(data)
        .eq('id', editingCampaign.id);

      if (error) toast.error('Erro: ' + error.message);
      else toast.success('Campanha actualizada');
    } else {
      const { error } = await supabase
        .from('sponsored_campaigns')
        .insert(data);

      if (error) toast.error('Erro: ' + error.message);
      else toast.success('Campanha criada');
    }

    setIsSaving(false);
    setCampaignDialogOpen(false);
    fetchData();
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm('Tem a certeza que quer apagar esta campanha?')) return;
    
    const { error } = await supabase
      .from('sponsored_campaigns')
      .delete()
      .eq('id', id);

    if (error) toast.error('Erro: ' + error.message);
    else {
      toast.success('Campanha apagada');
      fetchData();
    }
  };

  // Ad handlers
  const openAdDialog = (ad?: SponsoredAd) => {
    if (ad) {
      setEditingAd(ad);
      setAdForm({
        campaign_id: ad.campaign_id || '',
        title: ad.title,
        description: ad.description || '',
        image_url: ad.image_url || '',
        link: ad.link || '',
        placement: ad.placement as 'feed' | 'hero' | 'sidebar',
        frequency: ad.frequency,
        is_active: ad.is_active,
      });
    } else {
      setEditingAd(null);
      setAdForm({
        campaign_id: campaigns[0]?.id || '',
        title: '',
        description: '',
        image_url: '',
        link: '',
        placement: 'feed',
        frequency: 8,
        is_active: true,
      });
    }
    setAdDialogOpen(true);
  };

  const saveAd = async () => {
    if (!adForm.title) {
      toast.error('O título é obrigatório');
      return;
    }

    setIsSaving(true);
    
    const data = {
      campaign_id: adForm.campaign_id || null,
      title: adForm.title,
      description: adForm.description || null,
      image_url: adForm.image_url || null,
      link: adForm.link || null,
      placement: adForm.placement,
      frequency: adForm.frequency,
      is_active: adForm.is_active,
    };

    if (editingAd) {
      const { error } = await supabase
        .from('sponsored_ads')
        .update(data)
        .eq('id', editingAd.id);

      if (error) toast.error('Erro: ' + error.message);
      else toast.success('Anúncio actualizado');
    } else {
      const { error } = await supabase
        .from('sponsored_ads')
        .insert(data);

      if (error) toast.error('Erro: ' + error.message);
      else toast.success('Anúncio criado');
    }

    setIsSaving(false);
    setAdDialogOpen(false);
    fetchData();
  };

  const deleteAd = async (id: string) => {
    if (!confirm('Tem a certeza que quer apagar este anúncio?')) return;
    
    const { error } = await supabase
      .from('sponsored_ads')
      .delete()
      .eq('id', id);

    if (error) toast.error('Erro: ' + error.message);
    else {
      toast.success('Anúncio apagado');
      fetchData();
    }
  };

  const toggleAdStatus = async (ad: SponsoredAd) => {
    const { error } = await supabase
      .from('sponsored_ads')
      .update({ is_active: !ad.is_active })
      .eq('id', ad.id);

    if (error) toast.error('Erro: ' + error.message);
    else fetchData();
  };

  if (isLoading) {
    return (
      <AdminLayout title="Publicidade">
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Publicidade">
      <Tabs defaultValue="campaigns" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
            <TabsTrigger value="ads">Anúncios</TabsTrigger>
          </TabsList>
        </div>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Gerir campanhas publicitárias dos anunciantes.
            </p>
            <Dialog open={campaignDialogOpen} onOpenChange={setCampaignDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openCampaignDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova campanha
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCampaign ? 'Editar Campanha' : 'Nova Campanha'}
                  </DialogTitle>
                  <DialogDescription>
                    Configure os detalhes da campanha publicitária.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Campanha *</Label>
                    <Input
                      id="name"
                      value={campaignForm.name}
                      onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                      placeholder="Ex: Black Friday 2024"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="advertiser">Anunciante *</Label>
                    <Input
                      id="advertiser"
                      value={campaignForm.advertiser}
                      onChange={(e) => setCampaignForm({ ...campaignForm, advertiser: e.target.value })}
                      placeholder="Nome da empresa"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_date">Data Início</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={campaignForm.start_date}
                        onChange={(e) => setCampaignForm({ ...campaignForm, start_date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_date">Data Fim</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={campaignForm.end_date}
                        onChange={(e) => setCampaignForm({ ...campaignForm, end_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_active">Campanha activa</Label>
                    <Switch
                      id="is_active"
                      checked={campaignForm.is_active}
                      onCheckedChange={(checked) => setCampaignForm({ ...campaignForm, is_active: checked })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCampaignDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={saveCampaign} disabled={isSaving}>
                    {isSaving ? 'A guardar...' : 'Guardar'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {campaigns.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-primary" />
                  Campanhas
                </CardTitle>
                <CardDescription>Nenhuma campanha activa</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Crie campanhas para gerir os anúncios patrocinados que aparecem no feed.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Anunciante</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell>{campaign.advertiser}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {campaign.start_date && campaign.end_date
                          ? `${format(new Date(campaign.start_date), 'd MMM', { locale: pt })} - ${format(new Date(campaign.end_date), 'd MMM', { locale: pt })}`
                          : 'Sem período definido'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={campaign.is_active ? 'default' : 'secondary'}>
                          {campaign.is_active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openCampaignDialog(campaign)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteCampaign(campaign.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Ads Tab */}
        <TabsContent value="ads" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Gerir anúncios individuais e seu posicionamento.
            </p>
            <Dialog open={adDialogOpen} onOpenChange={setAdDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openAdDialog()} disabled={campaigns.length === 0}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo anúncio
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingAd ? 'Editar Anúncio' : 'Novo Anúncio'}
                  </DialogTitle>
                  <DialogDescription>
                    Configure os detalhes do anúncio patrocinado.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                  <div className="space-y-2">
                    <Label htmlFor="ad_campaign">Campanha</Label>
                    <Select
                      value={adForm.campaign_id}
                      onValueChange={(value) => setAdForm({ ...adForm, campaign_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione campanha" />
                      </SelectTrigger>
                      <SelectContent>
                        {campaigns.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name} ({c.advertiser})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ad_title">Título *</Label>
                    <Input
                      id="ad_title"
                      value={adForm.title}
                      onChange={(e) => setAdForm({ ...adForm, title: e.target.value })}
                      placeholder="Título do anúncio"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ad_description">Descrição</Label>
                    <Textarea
                      id="ad_description"
                      value={adForm.description}
                      onChange={(e) => setAdForm({ ...adForm, description: e.target.value })}
                      placeholder="Texto do anúncio..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ad_image">URL da Imagem</Label>
                    <Input
                      id="ad_image"
                      value={adForm.image_url}
                      onChange={(e) => setAdForm({ ...adForm, image_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ad_link">Link de Destino</Label>
                    <Input
                      id="ad_link"
                      value={adForm.link}
                      onChange={(e) => setAdForm({ ...adForm, link: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ad_placement">Posição</Label>
                      <Select
                        value={adForm.placement}
                        onValueChange={(value) => setAdForm({ ...adForm, placement: value as typeof adForm.placement })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="feed">Feed</SelectItem>
                          <SelectItem value="hero">Hero</SelectItem>
                          <SelectItem value="sidebar">Sidebar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ad_frequency">Frequência (a cada N artigos)</Label>
                      <Input
                        id="ad_frequency"
                        type="number"
                        min="1"
                        max="20"
                        value={adForm.frequency}
                        onChange={(e) => setAdForm({ ...adForm, frequency: parseInt(e.target.value) || 8 })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ad_is_active">Anúncio activo</Label>
                    <Switch
                      id="ad_is_active"
                      checked={adForm.is_active}
                      onCheckedChange={(checked) => setAdForm({ ...adForm, is_active: checked })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAdDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={saveAd} disabled={isSaving}>
                    {isSaving ? 'A guardar...' : 'Guardar'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {campaigns.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  Crie primeiro uma campanha antes de adicionar anúncios.
                </p>
              </CardContent>
            </Card>
          ) : ads.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  Nenhum anúncio criado ainda.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Campanha</TableHead>
                    <TableHead>Posição</TableHead>
                    <TableHead>Impressões</TableHead>
                    <TableHead>Cliques</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ads.map((ad) => (
                    <TableRow key={ad.id}>
                      <TableCell className="font-medium">{ad.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {ad.campaign?.name || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {ad.placement === 'feed' ? 'Feed' : ad.placement === 'hero' ? 'Hero' : 'Sidebar'}
                        </Badge>
                      </TableCell>
                      <TableCell>{ad.impressions.toLocaleString()}</TableCell>
                      <TableCell>{ad.clicks.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={ad.is_active ? 'default' : 'secondary'}>
                          {ad.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleAdStatus(ad)}
                        >
                          {ad.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openAdDialog(ad)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteAd(ad.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
