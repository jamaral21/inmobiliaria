# Casa Querétaro

Vista inicial del catálogo inmobiliario descrito en [`docs/PRD_Inmobiliaria_Queretaro.md`](docs/PRD_Inmobiliaria_Queretaro.md). Esta entrega cubre **solo la fase 1**. Todo el inventario visible es ficticio y se identifica como demostración.

## Requisitos

- Node.js 22 LTS (Next.js 16 requiere Node.js 20.9 o posterior).
- npm.
- PostgreSQL no es necesario para ejecutar la fase 1; el modelo y la conexión quedan preparados para la fase 2.

## Desarrollo local

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Abre <http://localhost:3000>. Para validar el esquema Prisma, usa la URL de PostgreSQL de ejemplo (o una instancia local):

```bash
DATABASE_URL='postgresql://demo:demo@localhost:5432/inmobiliaria_demo?schema=public' npm run db:validate
```

La app usa fixtures en memoria y no abre conexiones ni guarda formularios. El formulario solo muestra un mensaje indicando que no envió, guardó ni creó una solicitud.

## Rutas de la fase 1

| Ruta | Comportamiento |
|---|---|
| `/` | Inicio, búsqueda y propiedades destacadas |
| `/propiedades` | Catálogo con filtros GET combinables por zona, tipo, recámaras y presupuesto máximo |
| `/propiedades/[slug]` | Ficha disponible; las fichas reservadas/vendidas de muestra indican estado y no ofrecen CTA |
| `/casas-en-venta/[zona]` | Listado de muestra; no indexable mientras el contenido editorial no sea validado |
| `/vende-tu-casa` | Interfaz de formulario en modo demo, sin persistencia |
| `/aviso-de-privacidad` | Texto provisional, explícitamente pendiente de aprobación |
| `/robots.txt`, `/sitemap.xml` | No indexación por defecto; sitemap vacío en preview |

El catálogo público y el sitemap solo incluyen propiedades `available`; el catálogo pagina seis resultados por página. Las fichas `draft` y `withdrawn` devuelven 404. Las fichas `reserved` y `sold` se pueden consultar en la demo con estado visible, `noindex` y sin CTA. Los filtros y el número de página se conservan en la URL y no se indexan.

## Verificaciones

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

La salida HTML estática lee `INDEXABLE` y `SITE_URL` durante la compilación. Para indexar producción, genera una imagen con `INDEXABLE=true` y el dominio canónico real, y despliega con el mismo `INDEXABLE=true` **solo después de sustituir los datos de demostración, verificar el inventario y aprobar el contenido**. Los valores predeterminados son seguros para una vista previa (`INDEXABLE=false`).

## Vista previa restringida en Cloud Run

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

La app de esta fase no consulta PostgreSQL. `DATABASE_URL` es solo la preparación del modelo Prisma; no la configures en el servicio de preview hasta implementar y revisar la capa de datos. Para cerrar la vista previa, elimina el servicio y revoca las políticas de acceso y secretos de demo.

## Fase 2 pendiente

- Definir modelo de inventario aprobado y persistencia PostgreSQL; migrar datos reales únicamente con autorización.
- Implementar `/admin` con autenticación y permisos, importación CSV con vista previa, edición y publicación; ocultar datos internos de la API pública.
- Añadir galería administrable y carga de imágenes con limpieza de metadatos; recorrido 360° opcional.
- Validar inventario, zonas, contenido editorial, aviso de privacidad, marca y criterios de acceso con el socio antes de indexar.
- No implementar en esta entrega los leads persistentes, integración CRM, WhatsApp, chatbot, eventos analíticos ni webhooks de fases posteriores.
