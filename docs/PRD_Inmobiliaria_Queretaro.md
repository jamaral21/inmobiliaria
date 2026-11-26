# PRD · Catálogo inmobiliario de Querétaro
**Versión 0.4 · 25 de noviembre de 2026**

## Objetivo y piloto

Publicar el inventario autorizado del socio y convertir búsquedas, anuncios y consultas en visitas registradas. Lanzar con cinco propiedades y dos recorridos como metas del piloto. Hipótesis inicial: venta de casas usadas en una zona de Querétaro, preferentemente poniente si el inventario lo respalda. Confirmar colonias, precios y operación con el socio antes de publicar.

| Responsable | Entrega |
|---|---|
| José Luis | Producto, configuración del negocio digital y coordinación del lanzamiento |
| Socio inmobiliario | Inventario autorizado, precios y disponibilidad, visitas, negociación y cierre |
| Copilot | Implementación del sitio, catálogo, administración, CRM y chatbot. Integra APIs y webhooks según los contratos acordados |
| ChatGPT con José Luis | Diseño y validación del CRM y chatbot con Copilot, campañas, automatización, WhatsApp, bot de voz y seguimiento de métricas |

Antes de lanzar, identificar quién paga la pauta y los recorridos, cómo se atribuyen leads que cambian de inmueble y cómo se divide la comisión. El socio valida los datos, el permiso de publicación y los textos comerciales. Confirmar marca, dominio, responsable del aviso de privacidad, canal comercial y CRM. Utilizar datos ficticios en desarrollo y mantener el entorno de prueba fuera de los índices de búsqueda.

## MVP

| Ruta | Requisito |
|---|---|
| `/` | Propuesta comercial, propiedades destacadas y entradas al catálogo y a captación de propietarios |
| `/propiedades` | Listado paginado con filtros por zona, precio, tipo y recámaras, URLs compartibles y estado sin resultados |
| `/propiedades/[slug]` | Ficha con galería, precio MXN, superficie, distribución, zona, disponibilidad, recorrido opcional y CTA para solicitar visita o abrir WhatsApp |
| `/casas-en-venta/[zona]` | Páginas editoriales por zona, con inventario disponible y contenido propio validado |
| `/vende-tu-casa` | Solicitud de contacto para recibir un comparativo y conocer el plan de promoción |
| `/aviso-de-privacidad` | Texto aprobado por el negocio y enlazado desde los formularios |
| `/admin` | Acceso privado para importar inventario CSV con vista previa, editar fichas y cambiar estado. Vista de solicitudes web para el responsable comercial |

La ficha debe funcionar en móvil y conservar la solicitud de visita cuando no haya recorrido. En el MVP, pedir una visita genera una solicitud pendiente de confirmación humana. La confirmación automática de horarios llega con la integración del calendario. WhatsApp abre un mensaje con el código público del inmueble. El clic se mide aparte de una conversación recibida.

## Inventario

- Identificador estable y código público, slug único, título, descripción, tipo, operación, precio en MXN, municipio, colonia, recámaras, baños, estacionamientos, m² de terreno y construcción según disponibilidad, amenidades, fotos con texto alternativo, ubicación pública aproximada, recorrido opcional, fecha de verificación y estado.
- Estados `draft`, `available`, `reserved`, `sold` y `withdrawn`. El catálogo y las páginas de zona muestran únicamente disponibles. Las fichas reservadas o vendidas pueden mantenerse temporalmente con estado visible, alternativas y sin CTA sobre ese inmueble. Los borradores y retiros quedan fuera del sitio público. Cambiar el slug de una ficha publicada genera una redirección permanente cuando corresponda.
- Guardar autorización, referencia externa y notas del socio en campos privados. La API pública solo devuelve campos autorizados. Quitar metadatos de geolocalización de las imágenes publicadas.
- El CSV usa una referencia de origen estable para actualizar registros sin duplicarlos. La vista previa indica filas inválidas, cambios y duplicados antes de aplicar. Importar genera borradores cuando el inmueble es nuevo.

## SEO, accesibilidad y rendimiento

- Renderizar títulos, descripciones, precio y enlaces en HTML. Incluir metadatos únicos, canonical, Open Graph, breadcrumbs, sitemap de URLs indexables y robots apropiado por entorno.
- Los filtros combinados son compartibles y quedan fuera del sitemap y del índice. Las páginas de zona indexables requieren inventario disponible y contenido propio. Los enlaces HTML al catálogo, zonas y fichas permiten descubrir el contenido. Usar datos estructurados acordes con el contenido visible, como BreadcrumbList.
- Optimizar imágenes y reservar sus dimensiones. El recorrido carga al activarlo. Usar Pannellum para panoramas 360° enlazados por puntos, con galería como vía alternativa. Comparar escaneo 3D después del piloto.
- Navegación por teclado, foco visible, etiquetas en formularios, errores asociados al campo y contraste suficiente. Revisar móvil y escritorio. Objetivos al contar con datos de campo, percentil 75 móvil: LCP ≤ 2.5 s, INP ≤ 200 ms y CLS ≤ 0.1.

## Leads y contrato de integración v1

El sitio conserva un registro de las solicitudes web hasta que el CRM esté conectado. El CRM será la fuente del estado comercial. El catálogo será la fuente del precio público y disponibilidad para todos los canales.

- Alta web `POST /api/v1/leads`. Recibe `intent` (`buyer` o `seller`), `name`, teléfono o correo, `propertyId` cuando corresponda, mensaje opcional y contexto de atribución (UTM, ruta y referente si existen). El servidor fija `channel=web`, fecha e ID. Guardar la versión del aviso mostrado y el consentimiento cuando corresponda, con consentimiento promocional separado.
- Responder con ID y estado de recepción tras persistir. Validar en servidor, limitar abuso, evitar datos personales en logs y analítica y usar llave de idempotencia para reenvíos. Contactos repetidos pueden vincularse por teléfono o correo normalizados sin perder consultas distintas, propiedad ni origen.
- Eventos propuestos `lead.created` y `listing.updated`. Envelope con `id`, `type`, `version`, `occurredAt` y `data`. Cuando se conecten integraciones, entregar desde una cola persistente con firma, reintentos y deduplicación por ID del evento. Las bajas de inventario deben incluir ID y estado. Documentar esquemas y payloads ficticios en el repositorio. El MVP funciona antes de configurar webhooks.
- CRM: nuevo → contactado → calificado → visita agendada → visita realizada → oferta → cierre. El responsable humano confirma visitas y actualiza el estado. Voz, chat y WhatsApp se conectan mediante adaptadores al mismo CRM. Usar Retell AI como proveedor inicial de voz para el piloto. José Luis ya lo probó y considera que funciona bien para arrancar. En staging queda por validar que una llamada de prueba registre el lead en el CRM, genere una solicitud de visita pendiente de confirmación y derive a una persona cuando corresponda.
- Analítica: `listing_view`, `tour_open`, `whatsapp_click`, `lead_submitted`. Las etapas reales provienen del CRM. Evaluar propiedades autorizadas captadas, visitas realizadas, ofertas, costo por visita, tiempo de respuesta y margen por cierre. El margen descuenta reparto, pauta, recorridos, visitas y atención.

## Entrega por fases

1. **Base del sitio.** Respetar el stack existente. Para un repo vacío, propuesta provisional Next.js, TypeScript y PostgreSQL. Implementar rutas públicas, modelo, datos ficticios y SEO técnico. Dejar instrucciones reproducibles para desarrollo y para desplegar la vista previa en Cloud Run.
2. **Operación del catálogo.** Administración, importación, estados, recorrido 360° y carga del inventario validado.
3. **Captura web.** Formularios, solicitudes, atribución, enlaces WhatsApp, eventos de analítica y contratos de integración.
4. **CRM y chatbot.** Copilot implementa o conecta el CRM según la decisión del equipo. El CRM reúne historial, responsable, etapa, próxima acción y visitas. Copilot implementa el chatbot web con el flujo acordado en conjunto. El chatbot consulta inventario autorizado, registra leads, solicita visitas y transfiere a una persona las consultas que requieren seguimiento. Verificar con datos ficticios que formulario y chat llegan al mismo historial.
5. **Lanzamiento comercial.** Conectar agenda, campañas de compradores y propietarios por separado, programación de publicaciones, WhatsApp y voz con Retell AI. Validar reglas aplicables en Meta antes de activar pauta. Definir límites de gasto y retirar anuncios afectados por cambios de precio o disponibilidad. Probar cada canal hasta el registro de visita.

## Entorno de pruebas en Google Cloud Run

Usar un servicio de Cloud Run separado de producción y desplegar desde el repositorio de GitHub cuando esté disponible. Compartir una URL de prueba con el socio mediante acceso restringido. Mantener el entorno fuera del índice y usar inventario y contactos ficticios, o fichas autorizadas para revisión. Mantener configuración, secretos y datos separados de producción.

| Hito | Qué se prueba | Criterio para darlo por listo |
|---|---|---|
| Vista previa al terminar la fase 1 | Navegación móvil y de escritorio, listado, filtros, fichas y HTML para SEO | El socio puede entrar al enlace con acceso autorizado y revisar el catálogo. Las solicitudes de demo se identifican como tales. |
| Piloto de punta a punta | Recorridos 360° y flujo ficha → formulario o chatbot → CRM → solicitud de visita, con base de datos de pruebas | Cada solicitud válida queda en el CRM con inmueble, canal, estado pendiente y responsable. Se verifica que los reenvíos no creen duplicados. |

Las revisiones nuevas pueden probarse con una URL etiquetada antes de dirigirles tráfico. Registrar en el issue de cada prueba la rama o commit, el enlace de revisión con acceso restringido y el resultado. El CRM, el chatbot y el MCP pueden avanzar en paralelo a la primera vista previa. El MCP coordina el trabajo y queda fuera de las dependencias del despliegue.

## Aceptación del MVP

- Un usuario puede filtrar, abrir una ficha, ver su precio y enviar una solicitud en móvil. Una propiedad vendida o retirada se elimina del listado y del sitemap.
- Un usuario autorizado puede previsualizar un CSV, importar borradores y publicar una ficha completa. El usuario público carece de acceso a administración, borradores, contactos y campos internos.
- Un formulario válido genera una sola solicitud persistente aunque se reenvíe con la misma llave. Los errores muestran cómo corregir los datos. La interfaz confirma recepción después de persistir.
- Las fichas disponibles son rastreables en producción. Sitemap, canonicals, metadatos y enlaces se verifican. Staging queda fuera del índice. El sitio funciona con recorridos y cuentas externas sin configurar.
- Entregar resultados de compilación, lint y las pruebas disponibles, además del listado de rutas, variables de ejemplo sin secretos y pasos de desarrollo.

## Coordinación del proyecto

Usar este PRD como fuente de requisitos y versionarlo en `docs/PRD_Inmobiliaria_Queretaro.md`. Registrar trabajo y decisiones en issues y PRs. El repositorio guarda los esquemas de API y eventos. Cada entrega indica qué cambió, cómo se verificó y qué integración habilita. Usar datos ficticios en ejemplos y evitar contactos reales y credenciales en Git.

### MCP de coordinación entre Copilot y ChatGPT

Compartir un servidor MCP respaldado por el repositorio y su tablero. GitHub guarda los issues, PRs y decisiones. El servidor permite que cada asistente consulte el mismo estado y deje avances para la siguiente sesión.

| Herramienta propuesta | Uso |
|---|---|
| `list_tasks` y `get_task` | Consultar fase, responsable, criterios, dependencias, estado y PR asociado |
| `get_project_context` | Leer la versión vigente del PRD, decisiones y contratos |
| `record_handoff` | Agregar a un issue un avance con enlace a rama o PR, verificaciones, bloqueos y siguiente acción |
| `update_task_status` | Actualizar el estado explícitamente y registrar autor e historial de cambios |

Primer piloto con un issue de prueba y datos ficticios. Verificar que Copilot registra un avance, ChatGPT puede leerlo y una respuesta queda visible desde Copilot. Verificar por separado que las superficies usadas admiten conectar el mismo servidor con autenticación. Si alguna carece de soporte, usar los mismos issues y PRs directamente o mediante el conector disponible. Dar acceso por cliente y limitar la escritura a las operaciones del tablero. El servidor comparte estado cuando los clientes lo invocan. Si se necesita iniciar trabajo automáticamente al cambiar un issue, definir aparte el disparador y el mecanismo de ejecución.

Este MCP coordina el trabajo del equipo. El CRM y el chatbot operan mediante las APIs y webhooks de producción. Mantener contactos de clientes y credenciales fuera del servidor de coordinación.

## Prompt inicial para Copilot

> Lee `docs/PRD_Inmobiliaria_Queretaro.md` e inspecciona el repositorio. Implementa únicamente la fase 1 en una rama de trabajo. Reutiliza el stack existente. Si está vacío, usa la propuesta provisional del PRD. Usa datos ficticios marcados como demo, prepara las rutas públicas y prueba la navegación, los estados del catálogo y el SEO técnico. En esta fase los formularios pueden mostrar la interfaz con un estado de demo explícito. Evita confirmar solicitudes que todavía no se guardan. Documenta cómo desplegar la vista previa en Cloud Run con acceso restringido, datos de prueba y sin indexación. Ejecuta las verificaciones disponibles y entrega un resumen con archivos, instrucciones para arrancar, resultados y las tareas pendientes para la fase 2. El documento define los límites y criterios de aceptación de las fases siguientes.
