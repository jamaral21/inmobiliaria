# Casa Querétaro

Catálogo inmobiliario y panel privado de inventario descritos en [`docs/PRD_Inmobiliaria_Queretaro.md`](docs/PRD_Inmobiliaria_Queretaro.md). El seed local sigue usando fichas ficticias; el administrador puede editarlo o reemplazarlo sin reconstruir el sitio.

## Requisitos

- Node.js 22 LTS (Next.js 16 requiere Node.js 20.9 o posterior).
- npm.
- Docker y Docker Compose para PostgreSQL local.

## Desarrollo local

```bash
npm ci
cp .env.example .env
npm run db:up
npm run db:setup
npm run dev
```

Abre <http://localhost:3000>. Si no tienes Node.js 22 instalado, detén cualquier servidor Next.js de desarrollo anterior y ejecuta Next dentro de la red Compose para conectarlo con PostgreSQL:

```bash
docker run --rm -it --network inmobiliaria_default -p 127.0.0.1:43130:3000 -e DATABASE_URL=postgresql://habita:habita_dev_local_only@postgres:5432/habita_dev?schema=public -v "$PWD:/app" -w /app node:22 npm run dev -- --hostname 0.0.0.0 --port 3000
```

La base PostgreSQL local escucha solo en `127.0.0.1:55432`, persiste sus datos en un volumen Docker y se alimenta con las fichas ficticias de `src/lib/properties.ts`. `npm run db:setup` aplica las migraciones y carga el seed de forma idempotente. Las páginas públicas consultan PostgreSQL en tiempo de petición; si la base no está disponible, se muestra el error en lugar de sustituirlo silenciosamente con fixtures. Esta base local no está conectada a Cloud Run. Los formularios siguen en modo demo y no guardan solicitudes.

Valida el esquema con `npm run db:validate`.

La suite de integración contra PostgreSQL se ejecuta después de `db:setup`:

```bash
npm run test:db
```

Para apagar PostgreSQL sin borrar el volumen, ejecuta `docker compose stop postgres`. Para eliminar también todos los datos locales de prueba, ejecuta `docker compose down --volumes`.

## Administración de inventario

Abre `/admin` directamente; no hay enlaces desde la navegación pública, el footer ni el sitemap. El acceso usa Google OAuth y permite únicamente la dirección exacta configurada en `ADMIN_EMAIL`. No hay registro público, invitaciones ni gestión de otras cuentas. La primera sesión autorizada crea la cuenta interna; cada página y escritura administrativa vuelve a validar la sesión y la identidad en el servidor.

Para desarrollo local:

1. Crea un OAuth client de tipo aplicación web en Google Cloud Console. Añade `http://localhost:3000/api/auth/callback/google` como URI de redirección autorizada.
2. Configura `ADMIN_EMAIL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` en `.env` (nunca en Git). Genera un secreto con `openssl rand -base64 32`.
3. Aplica la migración con `npm run db:migrate` y abre `/admin`.

En Cloud Run, `BETTER_AUTH_URL` debe ser el origen HTTPS del servicio y la URI de Google debe ser `https://DOMINIO/api/auth/callback/google`. Guarda `DATABASE_URL`, `BETTER_AUTH_SECRET` y las credenciales de OAuth en Secret Manager; configura `ADMIN_EMAIL` y `BETTER_AUTH_URL` como variables no secretas. El build no requiere credenciales OAuth.

Si se pierde el acceso, confirma que la dirección Google verificada coincide con `ADMIN_EMAIL` y que OAuth y la base de datos están disponibles. Si se requiere reiniciar la cuenta interna, respalda la base y, con acceso administrativo autorizado, elimina solo la fila de esa dirección:

```sql
DELETE FROM auth_user WHERE lower(email) = lower('ADMIN_EMAIL');
```

Las sesiones y cuentas OAuth se eliminan por cascada; la cuenta autorizada se crea de nuevo al iniciar sesión. No agregues una ruta de registro ni insertes usuarios manualmente.

El panel permite editar fichas incompletas como borrador, muestra los datos faltantes para publicar y conserva el ID y código público al editar. La primera foto es portada; las líneas de la galería se pueden reordenar y cada foto requiere URL HTTPS y texto alternativo. No se suben archivos: se conservan URLs HTTPS persistentes. Los campos de autorización, referencia externa y notas del socio se editan únicamente en administración y no se incluyen en el repositorio de datos públicos. Cambiar el slug de una ficha previamente publicada registra una redirección permanente.

La importación CSV requiere estos encabezados: `sourceReference`, `slug`, `title`, `description`, `type`, `operation`, `priceMxn`, `municipality`, `neighborhood`, `bedrooms`, `bathrooms`, `parkingSpaces`, `constructionAreaSqm`, `landAreaSqm`, `amenities`, `photos`, `approximateLocation`, `tourUrl`, `verifiedAt`, `authorizationReference` y `partnerNotes`. Usa `sourceReference` estable, amenidades separadas por `|`, fotos con formato `URL|texto alternativo;URL|texto alternativo`, ubicación aproximada como JSON y fecha de verificación `YYYY-MM-DD`. La vista previa muestra filas inválidas, altas, cambios y filas sin cambios; al aplicar, las propiedades nuevas quedan como borradores y reimportar un archivo sin cambios no crea duplicados ni reescribe los registros.

Para aplicar migraciones en un entorno ya desplegado, respalda primero la base y ejecuta `npm run db:migrate:deploy` con el `DATABASE_URL` de ese entorno. La migración del panel es aditiva: conserva propiedades y añade tablas de autenticación y redirecciones, y permite valores faltantes únicamente para fichas incompletas.

## Rutas públicas y privadas

| Ruta | Comportamiento |
|---|---|
| `/` | Inicio, búsqueda y propiedades destacadas |
| `/propiedades` | Catálogo con filtros GET combinables por zona, tipo, recámaras y presupuesto máximo |
| `/propiedades/[slug]` | Ficha disponible; las fichas reservadas/vendidas indican estado y no ofrecen CTA |
| `/casas-en-venta/[zona]` | Listado de muestra; no indexable mientras el contenido editorial no sea validado |
| `/admin` | Administración privada, edición, estados y previsualización del inventario |
| `/admin/import` | Vista previa e importación CSV idempotente |
| `/vende-tu-casa` | Interfaz de formulario en modo demo, sin persistencia |
| `/aviso-de-privacidad` | Texto provisional, explícitamente pendiente de aprobación |
| `/robots.txt`, `/sitemap.xml` | No indexación por defecto; sitemap vacío en preview |

El catálogo público y el sitemap solo incluyen propiedades `available`; el catálogo pagina seis resultados por página. Las fichas `draft` y `withdrawn` devuelven 404. Las fichas `reserved` y `sold` conservan su ficha con estado visible, `noindex` y sin CTA. Los filtros y el número de página se conservan en la URL y no se indexan.

## Verificaciones

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

La salida HTML estática lee `INDEXABLE` y `SITE_URL` durante la compilación. Para indexar producción, genera una imagen con `INDEXABLE=true` y el dominio canónico real, y despliega con el mismo `INDEXABLE=true` **solo después de sustituir los datos de demostración, verificar el inventario y aprobar el contenido**. Los valores predeterminados son seguros para una vista previa (`INDEXABLE=false`).

## Vista previa restringida en Cloud Run

La revisión de Cloud Run desplegada actualmente sigue usando la imagen previa, sin PostgreSQL. El código local ya requiere la base de datos. No reconstruyas ni despliegues esta versión en Cloud Run hasta aprovisionar PostgreSQL administrado, guardar `DATABASE_URL` de producción en Secret Manager e inyectarlo al servicio.

1. Crea un servicio y repositorio de Artifact Registry separados de producción, en la región elegida. No conectes bases de datos, cuentas ni secretos de producción.
2. Construye y publica la imagen desde la raíz del repositorio. Reemplaza el nombre de Artifact Registry y `PREVIEW_HOST`; `cloudbuild.yaml` inyecta el origen canónico y deja la indexación desactivada durante el build:

   ```bash
   gcloud builds submit \
     --config cloudbuild.yaml \
     --substitutions=_IMAGE=REGION-docker.pkg.dev/PROJECT_ID/REPOSITORY/casa-queretaro-preview:COMMIT,_SITE_URL=https://PREVIEW_HOST,_INDEXABLE=false \
     .
   ```

   Si Cloud Run asigna el dominio después del primer despliegue, usa un dominio de preview conocido o reconstruye la imagen con el dominio asignado para que los canonicals coincidan. Las vistas previas nunca se indexan.
3. En Secret Manager crea `preview-username` y `preview-password` con credenciales aleatorias exclusivas para esta vista previa. Da a la identidad de servicio de Cloud Run permiso de lectura solo sobre esos secretos.
4. Despliega sin acceso público, con la indexación apagada y los secretos inyectados:

   ```bash
   gcloud run deploy casa-queretaro-preview \
     --image REGION-docker.pkg.dev/PROJECT_ID/REPOSITORY/casa-queretaro-preview:COMMIT \
     --region REGION \
     --platform managed \
     --port 8080 \
     --no-allow-unauthenticated \
     --set-env-vars INDEXABLE=false,PREVIEW_AUTH_ENABLED=true,SITE_URL=https://PREVIEW_HOST \
     --set-secrets PREVIEW_USERNAME=preview-username:latest,PREVIEW_PASSWORD=preview-password:latest
   ```

   `SITE_URL` debe ser el origen HTTPS asignado al servicio. No pases secretos como argumentos `--set-env-vars`. El servicio devuelve `401` si falta autenticación básica y `503` si se habilitó la protección pero faltan secretos.
5. Autoriza explícitamente las cuentas del equipo y del socio:

   ```bash
   gcloud run services add-iam-policy-binding casa-queretaro-preview \
     --region REGION \
     --member=user:CORREO_AUTORIZADO \
     --role=roles/run.invoker
   ```

   Repite el binding solo para cada identidad que deba revisar. El acceso de Cloud Run IAM restringe el servicio; la autenticación básica agrega una segunda barrera. Nunca uses `--allow-unauthenticated` en este servicio.
6. Comprueba con una identidad autorizada las rutas, filtros, detalles, `/robots.txt` y `/sitemap.xml`. Confirma que robots prohíbe rastreo, el sitemap está vacío y que el formulario indica que no envía ni guarda datos. No publiques la URL ni la imagen en canales abiertos.

La base PostgreSQL descrita en Desarrollo local solo corre en Docker y no se comparte con Cloud Run. Para cerrar la vista previa, elimina el servicio y revoca las políticas de acceso y secretos de demo.

## Despliegue de administración en Cloud Run

El servicio actual `inmobiliaria-staging` no tiene base de datos PostgreSQL configurada. Para probar `/admin` y que el catálogo cambie sin redeploy hace falta aprovisionar una instancia de Cloud SQL para staging, crear una base y usuario dedicados, conectar la identidad de servicio de Cloud Run, guardar `DATABASE_URL` y las credenciales OAuth en Secret Manager y aplicar las migraciones. No se ha creado ni desplegado ningún recurso de pago. La carga de archivos no está implementada, por lo que Cloud Storage no es un requisito de esta entrega.

- La migración `20261127100000_admin_inventory` es aditiva y no borra el inventario.
- Mantén staging con `INDEXABLE=false`; el contenido administrativo y el login declaran `noindex`.
- Mantén el inventario de staging separado del de producción y no cargues datos autorizados sin aprobación.
- La galería usa URLs HTTPS existentes y el recorrido 360° es opcional.
- Validar inventario, zonas, contenido editorial, aviso de privacidad, marca y criterios de acceso con el socio antes de indexar.
- No implementar en esta entrega los leads persistentes, integración CRM, WhatsApp, chatbot, eventos analíticos ni webhooks de fases posteriores.
