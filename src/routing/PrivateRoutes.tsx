import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'




import ParamettresPage from '@/pages/paramettres/ParamettresPage'
import TrajetsAnormauxPage from '@/pages/trajets-anormaux/page'
import FrequenceRavitaillementsPage from '@/pages/frequence-ravitaillements/page'
import EcoScoreChauffeursPage from '@/pages/eco-score-chauffeurs/page'
import ConsommationMoyenneFlottePage from '@/pages/consommation-moyenne-flotte/page'
import ConsoMoyenneVehiculePage from '@/pages/conso-moyenne-vehicule/page'
import VitesseMaxVehiculePage from '@/pages/vitesse-max-vehicule/page'
import ConsoPondereeLignePage from '@/pages/conso-ponderee-ligne/page'



const PrivateRoutes = () => {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="auth/*" element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        <Route path="trajets-anormaux" element={<TrajetsAnormauxPage />} />
        <Route
          path="frequence-ravitaillements"
          element={<FrequenceRavitaillementsPage />}
        />
        <Route
          path="consommation-moyenne-flotte"
          element={<ConsommationMoyenneFlottePage />}
        />
        <Route
          path="conso-moyenne-vehicule"
          element={<ConsoMoyenneVehiculePage />}
        />
        <Route
          path="vitesse-max-vehicule"
          element={<VitesseMaxVehiculePage />}
        />
        <Route
          path="conso-ponderee-ligne"
          element={<ConsoPondereeLignePage />}
        />
        <Route
          path="eco-score-chauffeurs"
          element={<EcoScoreChauffeursPage />}
        />
        <Route path="paramètres" element={<ParamettresPage />} />
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/error/404" replace />} />
      </Route>
    </Routes>
  )
}

export { PrivateRoutes }
