import * as React from "react"
import { User, Building2, Bell, Shield, Save } from "lucide-react"
import { DashboardLayoutHeader } from "@/layouts/components/DashboardLayoutHeader"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FAKE_USER } from "@/modules/auth/core/fakeUser"

const ParamettresPage = () => {
  const [name, setName] = React.useState(FAKE_USER.name)
  const [email, setEmail] = React.useState(FAKE_USER.email)
  const [companyName, setCompanyName] = React.useState("Ocean Transport")
  const [language, setLanguage] = React.useState("fr")
  const [timezone, setTimezone] = React.useState("Europe/Paris")
  const [notifEmail, setNotifEmail] = React.useState(true)
  const [notifAlertes, setNotifAlertes] = React.useState(true)
  const [notifRapports, setNotifRapports] = React.useState(false)
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [saved, setSaved] = React.useState(false)

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <>
      <DashboardLayoutHeader title="Paramètres" breadcrumb="Paramètres" />
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        {/* Profil */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Profil utilisateur</CardTitle>
            </div>
            <CardDescription>
              Modifiez vos informations personnelles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="grid gap-4 max-w-md">
              <div className="grid gap-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                />
              </div>
              <Button type="submit" size="sm">
                <Save className="mr-2 h-4 w-4" />
                Enregistrer le profil
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Entreprise / Application */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <CardTitle>Entreprise & Application</CardTitle>
            </div>
            <CardDescription>
              Paramètres de l&apos;entreprise et de l&apos;application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveCompany} className="grid gap-4 max-w-md">
              <div className="grid gap-2">
                <Label htmlFor="company">Nom de l&apos;entreprise</Label>
                <Input
                  id="company"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Nom de l'entreprise"
                />
              </div>
              <div className="grid gap-2">
                <Label>Langue</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir la langue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Fuseau horaire</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Fuseau horaire" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/Paris">Paris (UTC+1)</SelectItem>
                    <SelectItem value="Europe/London">Londres (UTC+0)</SelectItem>
                    <SelectItem value="America/New_York">New York (UTC-5)</SelectItem>
                    <SelectItem value="Africa/Abidjan">Abidjan (UTC+0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" size="sm">
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Choisissez les notifications que vous souhaitez recevoir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveNotifications} className="space-y-4 max-w-md">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notif-email"
                  checked={notifEmail}
                  onCheckedChange={(checked) => setNotifEmail(checked === true)}
                />
                <Label
                  htmlFor="notif-email"
                  className="text-sm font-normal cursor-pointer"
                >
                  Recevoir les résumés par email
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notif-alertes"
                  checked={notifAlertes}
                  onCheckedChange={(checked) => setNotifAlertes(checked === true)}
                />
                <Label
                  htmlFor="notif-alertes"
                  className="text-sm font-normal cursor-pointer"
                >
                  Alertes en temps réel (maintenance, contrôles, assurance)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notif-rapports"
                  checked={notifRapports}
                  onCheckedChange={(checked) => setNotifRapports(checked === true)}
                />
                <Label
                  htmlFor="notif-rapports"
                  className="text-sm font-normal cursor-pointer"
                >
                  Rapports hebdomadaires de consommation
                </Label>
              </div>
              <Button type="submit" size="sm">
                <Save className="mr-2 h-4 w-4" />
                Enregistrer les préférences
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sécurité */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Sécurité</CardTitle>
            </div>
            <CardDescription>
              Modifiez votre mot de passe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSavePassword} className="grid gap-4 max-w-md">
              <div className="grid gap-2">
                <Label htmlFor="current-password">Mot de passe actuel</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              <Separator />
              <div className="grid gap-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" size="sm">
                <Save className="mr-2 h-4 w-4" />
                Changer le mot de passe
              </Button>
            </form>
          </CardContent>
        </Card>

        {saved && (
          <div className="fixed bottom-4 right-4 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow-lg flex items-center gap-2">
            <Save className="h-4 w-4" />
            Paramètres enregistrés
          </div>
        )}
      </div>
    </>
  )
}

export default ParamettresPage
