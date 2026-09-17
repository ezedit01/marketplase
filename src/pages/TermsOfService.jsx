import { APP_NAME } from '../components/layout/Logo'
import './LegalPage.css'

export default function TermsOfService() {
  return (
    <div className="container legal-page">
      <h1>Términos y Condiciones</h1>
      <p className="legal-updated">Última actualización: {new Date().toLocaleDateString('es-AR')}</p>

      <p>
        Estos Términos y Condiciones regulan el uso de {APP_NAME}, una plataforma digital
        que conecta a personas, comercios y prestadores de servicios de Sol de Julio. Al
        usar {APP_NAME} aceptás estos términos.
      </p>

      <h2>1. Qué es {APP_NAME}</h2>
      <p>
        {APP_NAME} es un espacio donde cualquier persona puede publicar productos para
        vender, negocios, servicios, búsquedas de empleo, eventos y promociones locales.
        El contacto entre quien publica y quien está interesado se realiza por WhatsApp,
        fuera de la plataforma.
      </p>

      <h2>2. {APP_NAME} no es parte de las operaciones entre usuarios</h2>
      <p>
        {APP_NAME} es un espacio de encuentro e información, no un intermediario de
        pagos ni un garante de las transacciones. No participamos en las conversaciones,
        acuerdos, pagos ni entregas que se realicen entre usuarios. Cada persona es
        responsable de verificar lo que compra, vende o contrata, y de acordar los
        términos directamente con la otra parte.
      </p>

      <h2>3. Cuenta de usuario</h2>
      <p>
        Para publicar necesitás crear una cuenta con tu email. Sos responsable de la
        información que cargás en tu perfil y en tus publicaciones, y de que sea
        veraz. No se permite crear cuentas con datos falsos ni suplantar a otra persona
        o negocio.
      </p>

      <h2>4. Qué no está permitido publicar</h2>
      <ul>
        <li>Productos o servicios prohibidos por ley, robados o de origen ilegal.</li>
        <li>Contenido falso, engañoso, o que intente estafar a otros usuarios.</li>
        <li>Contenido ofensivo, discriminatorio o que incite a la violencia.</li>
        <li>Spam, publicaciones duplicadas, o contenido ajeno al propósito de cada sección.</li>
        <li>Datos de contacto o información personal de terceros sin su consentimiento.</li>
      </ul>
      <p>
        Cualquier publicación puede reportarse desde el botón "Reportar" en el detalle del
        producto. Nos reservamos el derecho de eliminar publicaciones o cuentas que
        incumplan estos términos.
      </p>

      <h2>5. Calificaciones</h2>
      <p>
        El sistema de calificaciones de vendedores se basa en la buena fe de los
        usuarios. Como el contacto y la transacción ocurren por WhatsApp, no podemos
        verificar que cada calificación corresponda a una operación real. Reportá
        cualquier calificación que consideres falsa o abusiva.
      </p>

      <h2>6. Publicaciones destacadas y futuras funciones pagas</h2>
      <p>
        {APP_NAME} podrá ofrecer en el futuro funciones pagas, como destacar una
        publicación o perfiles comerciales premium. Cuando eso ocurra, se van a detallar
        las condiciones específicas de precio y alcance antes de cualquier cobro.
      </p>

      <h2>7. Propiedad de tu contenido</h2>
      <p>
        Las fotos, textos y datos que publicás siguen siendo tuyos. Al publicarlos en
        {' '}{APP_NAME} nos autorizás a mostrarlos dentro de la plataforma y en las
        previews que se generan al compartir un link (por ejemplo, en WhatsApp o
        Facebook).
      </p>

      <h2>8. Limitación de responsabilidad</h2>
      <p>
        {APP_NAME} se ofrece "tal cual está". No garantizamos disponibilidad
        ininterrumpida del servicio ni la veracidad de lo publicado por los usuarios.
        En la medida permitida por la ley, no somos responsables por daños derivados
        del uso de la plataforma o de las operaciones entre usuarios.
      </p>

      <h2>9. Cambios a estos términos</h2>
      <p>
        Podemos actualizar estos términos a medida que la plataforma crece. Si hacemos
        cambios importantes, lo vamos a comunicar de forma visible en el sitio.
      </p>

      <h2>10. Contacto</h2>
      <p>
        Para consultas sobre estos términos, escribinos por WhatsApp desde el mismo
        contacto que usás para publicar, o a través de los medios de contacto de KREA.
      </p>
    </div>
  )
}
