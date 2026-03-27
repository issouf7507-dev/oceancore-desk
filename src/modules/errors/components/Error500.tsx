import { type FC } from 'react'
import { Link } from 'react-router-dom'

const Error500: FC = () => {
  return (
    <>
      {/* begin::Title */}
      <h1 className='fw-bolder fs-2qx text-gray-900 mb-4'>Erreur système</h1>
      {/* end::Title */}

      {/* begin::Text */}
      <div className='fw-semibold fs-6 text-gray-500 mb-7'>
        Une erreur est survenue. Veuillez réessayer plus tard.
      </div>
      {/* end::Text */}


      {/* begin::Link */}
      <div className='mb-0'>
        <Link to='/dashboard' className='btn btn-sm btn-primary'>
          Retour à l'accueil
        </Link>
      </div>
      {/* end::Link */}
    </>
  )
}

export { Error500 }
