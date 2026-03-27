import { type FC } from 'react'
import { Link } from 'react-router-dom'


const Error404: FC = () => {
  return (
    <>
      {/* begin::Title */}
      <h1 className='fw-bolder fs-2hx text-gray-900 mb-4'>Oups!</h1>
      {/* end::Title */}

      {/* begin::Text */}
      <div className='fw-semibold fs-6 text-gray-500 mb-7'>Nous ne pouvons pas trouver cette page.</div>
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

export { Error404 }
