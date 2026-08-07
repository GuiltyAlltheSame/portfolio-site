export const codeSamples = {
  HTML5: `HTML defines the semantic structure and content of a web page. Meaningful elements make interfaces clearer for users, browsers, and assistive technology.

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Portfolio</title>
  </head>
  <body>
    <main>
      <h1>Welcome</h1>
      <p>Accessible, structured content.</p>
    </main>
  </body>
</html>`,

  CSS: `CSS controls the visual presentation of HTML: layout, responsive behavior, typography, colours, and animation. Flexbox and Grid solve different layout problems and work well together.

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
}

.project-card {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border: 1px solid currentColor;
}`,

  'SCSS/PostCSS': `SCSS adds variables, nesting, mixins, and reusable patterns to CSS. PostCSS transforms the final stylesheet with plugins such as Autoprefixer and minifiers.

$accent: #8aff3c;

.terminal {
  color: $accent;

  &__button {
    border: 2px solid currentColor;

    &:hover {
      background: $accent;
      color: #000;
    }
  }
}`,

  'Bootstrap 5': `Bootstrap 5 is a mobile-first UI framework with a responsive grid and ready-made components. It helps build consistent interfaces quickly while still allowing custom styling.

<div class="container py-5">
  <div class="row g-4">
    <div class="col-md-6 col-lg-4">
      <article class="card h-100">
        <div class="card-body">
          <h2 class="h5 card-title">Project</h2>
          <a class="btn btn-primary" href="#">Open</a>
        </div>
      </article>
    </div>
  </div>
</div>`,

  'GPT Prompt Writing': `Prompt writing turns a goal into clear instructions for an AI model. A useful prompt defines the role, context, task, constraints, and the expected output format.

ROLE: You are a senior frontend reviewer.
CONTEXT: This component has an inaccessible modal.
TASK: List the three most important fixes.
CONSTRAINTS: Use plain English and explain why each fix matters.
OUTPUT: A numbered Markdown list.`,

  'Adobe Photoshop/Illustrator/InDesign': `Adobe Photoshop, Illustrator, and InDesign cover raster editing, vector graphics, and page layout. They are used to prepare visual assets, brand systems, print materials, and export-ready files.

WORKFLOW
1. Build the layout with a consistent grid.
2. Keep source layers and vector paths editable.
3. Export the right format: SVG for icons, PNG/WebP for raster art, PDF for print.`,

  'CSS/GSAP': `GSAP is a JavaScript animation library for precise, high-performance motion. It can animate CSS properties and coordinate scroll-driven sequences with ScrollTrigger.

gsap.from('.project-card', {
  opacity: 0,
  y: 24,
  duration: 0.6,
  stagger: 0.12,
  ease: 'power2.out'
});`,

  JavaScript: `JavaScript adds behavior to the browser: it responds to user input, updates the DOM, manages state, and communicates with APIs. ES6+ provides modules, async functions, destructuring, and modern collection methods.

const button = document.querySelector('[data-menu-toggle]');
const menu = document.querySelector('#menu');

button.addEventListener('click', () => {
  const isOpen = menu.classList.toggle('is-open');
  button.setAttribute('aria-expanded', String(isOpen));
});`,

  Blender: `Blender is a 3D creation suite for modelling, materials, lighting, animation, and rendering. Its Python API also makes repetitive scene work automatable.

import bpy

bpy.ops.mesh.primitive_cube_add(location=(0, 0, 0))
cube = bpy.context.active_object
cube.rotation_euler[2] = 0.785
cube.name = 'PortfolioCube'`,

  'Godot Engine': `Godot is an open-source game engine built around scenes, nodes, and scripts. GDScript is designed for concise gameplay logic and integrates directly with Godot's node system.

extends CharacterBody2D

@export var speed := 240.0

func _physics_process(_delta):
  var direction = Input.get_vector('ui_left', 'ui_right', 'ui_up', 'ui_down')
  velocity = direction * speed
  move_and_slide()`,

  Python: `Python is a readable, general-purpose language used for automation, data work, backend services, testing, and tooling. Its standard library makes small utilities quick to build.

from pathlib import Path

def find_images(folder: str) -> list[Path]:
    return sorted(
        path for path in Path(folder).iterdir()
        if path.suffix.lower() in {'.png', '.jpg', '.webp'}
    )

print(find_images('assets/img'))`,

  SQL: `SQL queries and manages relational data. Good SQL models relationships clearly, selects only needed fields, and uses parameters rather than interpolating user input.

SELECT p.title, COUNT(r.id) AS review_count
FROM projects AS p
LEFT JOIN reviews AS r ON r.project_id = p.id
GROUP BY p.id, p.title
ORDER BY review_count DESC;`,

  'Git/GitHub flow': `Git tracks changes locally; GitHub Flow keeps work small and reviewable through short-lived branches, pull requests, checks, and merge commits.

git switch -c feat/theme-switcher
git add src/css/style.css src/js/ui/theme-switcher.js
git commit -m "Add theme switcher"
git push -u origin feat/theme-switcher
# Open a pull request, review it, then merge after checks pass.`,

  'Linux&CLI': `The Linux command line is a fast interface for navigating files, inspecting processes, automating tasks, and working with remote servers. Small commands can be safely composed into repeatable workflows.

# Find JavaScript files that contain a selector.
rg -n "data-theme" src

# Show the current directory and its files.
pwd
ls -la

# Inspect a running process by name.
ps aux | rg "node"`,

  PowerShell: `PowerShell is a cross-platform shell and scripting language built around structured objects rather than plain text. It is especially useful for Windows automation and system administration.

Get-ChildItem -Path src -Recurse -Filter *.js |
  Select-String -Pattern 'addEventListener' |
  Select-Object Path, LineNumber, Line

Get-Date -Format 'yyyy-MM-dd HH:mm'`,

  'Node.js': `Node.js runs JavaScript outside the browser. Express is commonly used with Node.js to define HTTP routes, middleware, APIs, and server-side integrations.

import express from 'express';

const app = express();
app.use(express.json());

app.get('/api/status', (_request, response) => {
  response.json({ ok: true, service: 'portfolio-api' });
});

app.listen(3000);`,

  WordPress: `WordPress is a content management system powered by PHP, themes, plugins, and a database. Theme templates render content while the admin panel lets non-developers manage it.

<?php get_header(); ?>
<main class="site-main">
  <?php if (have_posts()) : while (have_posts()) : the_post(); ?>
    <article <?php post_class(); ?>>
      <h1><?php the_title(); ?></h1>
      <?php the_content(); ?>
    </article>
  <?php endwhile; endif; ?>
</main>
<?php get_footer(); ?>`,

  React: `React builds interfaces from reusable components and state. Components describe what the UI should look like for the current data; React updates the DOM when that data changes.

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Clicks: {count}
    </button>
  );
}`,

  'CompTIA A+': `CompTIA A+ covers practical IT support: hardware, operating systems, troubleshooting, networking basics, and security hygiene. The discipline is to diagnose methodically before replacing components.

# Windows: inspect system and network basics.
systeminfo
ipconfig /all

# Test name resolution and connectivity.
nslookup example.com
ping example.com`,

  'CompTIA Network+': `CompTIA Network+ focuses on network design, addressing, switching, routing, wireless, and troubleshooting. A repeatable test path narrows a failure from the device to the gateway, DNS, and the remote service.

# Inspect the route to a remote host.
tracert example.com

# Query DNS directly.
nslookup example.com 1.1.1.1

# Check local listening ports.
netstat -ano`,

  'CompTIA Security+': `CompTIA Security+ covers foundational cybersecurity: identity, secure configuration, risk management, incident response, and network defence. The goal is to reduce risk while keeping systems usable.

# Generate a random password locally with PowerShell.
$bytes = New-Object byte[] 18
[Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
[Convert]::ToBase64String($bytes)

# Principle: use unique passwords and enable MFA.`,

  'Cisco CCNA': `Cisco CCNA validates core networking skills: IPv4/IPv6 addressing, switching, routing, VLANs, wireless, security basics, and automation awareness. Cisco IOS configuration makes intent explicit and testable.

enable
configure terminal
interface GigabitEthernet0/1
  description Uplink to switch
  switchport mode access
  switchport access vlan 20
  no shutdown
end
write memory`
};
