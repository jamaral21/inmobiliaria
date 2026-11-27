# Casa Querétaro

Vista inicial del catálogo inmobiliario descrito en [`docs/PRD_Inmobiliaria_Queretaro.md`](docs/PRD_Inmobiliaria_Queretaro.md). Esta entrega cubre **solo la fase 1**. Todo el inventario visible es ficticio y se identifica como demostración.

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

## Fase 2 pendiente

- Aprovisionar PostgreSQL administrado para Cloud Run con credenciales en Secret Manager; migrar datos reales únicamente con autorización.
- Implementar `/admin` con autenticación y permisos, importación CSV con vista previa, edición y publicación; ocultar datos internos de la API pública.
- Añadir galería administrable y carga de imágenes con limpieza de metadatos; recorrido 360° opcional.
- Validar inventario, zonas, contenido editorial, aviso de privacidad, marca y criterios de acceso con el socio antes de indexar.
- No implementar en esta entrega los leads persistentes, integración CRM, WhatsApp, chatbot, eventos analíticos ni webhooks de fases posteriores.
