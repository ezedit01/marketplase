import { APP_NAME } from '../components/layout/Logo'
import './LegalPage.css'

export default function PrivacyPolicy() {
  return (
    <div className="container legal-page">
      <h1>Política de Privacidad</h1>
      <p className="legal-updated">Última actualización: {new Date().toLocaleDateString('es-AR')}</p>

      <p>
        Esta política explica qué datos recolecta {APP_NAME}, para qué se usan, y qué
        derechos tenés sobre ellos, en línea con la Ley 25.326 de Protección de Datos
        Personales de Argentina.
      </p>

      <h2>1. Qué datos recolectamos</h2>
      <ul>
        <li><strong>Al registrarte:</strong> nombre y email.</li>
        <li>
          <strong>En tu perfil (opcional):</strong> foto de perfil, número de WhatsApp,
          ubicación/zona.
        </li>
        <li>
          <strong>Al publicar:</strong> título, descripción, precio, fotos, categoría y
          ubicación de lo que publiques (producto, negocio, servicio, empleo o evento).
        </li>
        <li>
          <strong>Actividad dentro de la plataforma:</strong> favoritos, calificaciones
          que hacés a vendedores, alertas de búsqueda que guardás.
        </li>
        <li>
          <strong>En tu dispositivo (no se envía a nuestros servidores):</strong> el
          historial de productos vistos recientemente se guarda solo en tu navegador
          (localStorage), no en nuestra base de datos, y podés borrarlo vos mismo desde
          la sección "Vistos recientemente".
        </li>
      </ul>

      <h2>2. Para qué usamos tus datos</h2>
      <ul>
        <li>Mostrar tus publicaciones y tu perfil a otros usuarios.</li>
        <li>Generar el link de contacto por WhatsApp cuando alguien quiere consultarte.</li>
        <li>Avisarte (dentro de la plataforma, en la campanita de notificaciones) cuando aparece algo nuevo que coincide con una alerta que guardaste.</li>
        <li>Generar la vista previa (foto, título, precio) cuando compartís un link por WhatsApp o redes sociales.</li>
        <li>Moderar contenido reportado por otros usuarios.</li>
      </ul>
      <p>
        No usamos tus datos para publicidad ni se los vendemos a terceros.
      </p>

      <h2>3. Con quién compartimos datos</h2>
      <p>
        Tus datos se almacenan con nuestros proveedores de infraestructura: la base de
        datos y el almacenamiento de imágenes están en <strong>Supabase</strong>, y el
        sitio se sirve a través de <strong>Cloudflare</strong>. No compartimos tus datos
        con nadie más, salvo que la ley nos obligue a hacerlo.
      </p>
      <p>
        Tu número de WhatsApp y tu nombre son visibles públicamente si los mostrás en
        una publicación o perfil — eso es necesario para que la plataforma cumpla su
        función de conectar personas. Tu email nunca se muestra públicamente.
      </p>

      <h2>4. Cuánto tiempo guardamos tus datos</h2>
      <p>
        Mientras tu cuenta esté activa. Si eliminás una publicación, negocio, servicio o
        aviso, deja de ser visible para otros usuarios. Si querés eliminar tu cuenta por
        completo, escribinos por los medios de contacto abajo.
      </p>

      <h2>5. Tus derechos</h2>
      <p>
        Tenés derecho a acceder, rectificar, actualizar o solicitar la eliminación de tus
        datos personales en cualquier momento. Muchos de estos cambios los podés hacer
        vos mismo desde "Editar perfil". Para lo que no puedas resolver ahí (por ejemplo,
        eliminar tu cuenta por completo), contactanos.
      </p>
      <p>
        La Agencia de Acceso a la Información Pública, en su carácter de Órgano de
        Control de la Ley 25.326, tiene la atribución de atender las denuncias y
        reclamos que se interpongan con relación al incumplimiento de las normas sobre
        protección de datos personales.
      </p>

      <h2>6. Seguridad</h2>
      <p>
        Aplicamos controles de acceso a nivel de base de datos (cada usuario solo puede
        modificar sus propios datos) y conexiones cifradas (HTTPS) en todo el sitio. Ningún
        sistema es 100% infalible, pero tomamos medidas razonables para proteger tu
        información.
      </p>

      <h2>7. Cambios a esta política</h2>
      <p>
        Si hacemos cambios importantes a esta política, lo vamos a comunicar de forma
        visible en el sitio.
      </p>

      <h2>8. Contacto</h2>
      <p>
        Para ejercer tus derechos sobre tus datos personales o hacer cualquier consulta
        de privacidad, escribinos por los medios de contacto de KREA.
      </p>
    </div>
  )
}
