# Chef Michelin Luis Ojeda — Menú Digital Interactivo

Sitio de una sola página (HTML/CSS/JS estático, sin build) para la cena a 9
tiempos del Chef Michelin Luis Ojeda en el Jardín Mirador de Aguamiel,
Táchira.

## Ver en local

Abre `index.html` directamente en el navegador, o sirve la carpeta con
cualquier servidor estático:

```bash
npx serve .
```

## Desplegar en Vercel

Este proyecto no necesita build ni `package.json`: es HTML/CSS/JS puro.

1. Entra a https://vercel.com/new
2. Elige **Import Git Repository** y selecciona este repositorio
   (`edicion-wais/menu-michelin`) y la rama `claude/menu-gastronomico-digital-bpy6l3`.
3. En "Framework Preset" deja **Other** — Vercel detectará el `index.html`
   en la raíz automáticamente. No hace falta comando de build ni output
   directory.
4. Haz clic en **Deploy**. Vercel te dará una URL de preview del tipo
   `menu-michelin-xxxx.vercel.app` para revisar antes de publicar.
5. Cuando quieras usar tu propio subdominio (por ejemplo
   `menu.tudominio.com`), ve a **Project → Settings → Domains**, agrega el
   subdominio y crea el registro CNAME que Vercel te indique en tu
   proveedor de DNS.

Cada push a esta rama generará automáticamente una nueva URL de preview en
Vercel antes de promoverla a producción.

## Estructura

```
index.html        Contenido y estructura de la página
css/style.css      Estilos (paleta vino/dorado, tipografías, animaciones)
js/main.js         Interactividad (acordeón del menú, scroll-spy, reveals)
assets/            Imágenes y favicon
```
