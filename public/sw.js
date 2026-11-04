const CACHE = "crew-health-v13";
const BASE = [
  "/",
  "/manifest.webmanifest",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/games/move-the-moon/assets/assets/images/asteroid.c9fce3cea59cf2ce95bc289247ae07ad.png",
  "/games/move-the-moon/assets/assets/images/blood_moon.22c4a81bf7aeca9b36789fd55fbca609.png",
  "/games/move-the-moon/assets/assets/images/cheese_moon.cb55ecd1149cd5fe916972b44f1e9832.png",
  "/games/move-the-moon/assets/assets/images/cyber_earth.9dfe997bc7e0d772fb68ee46ed8501ff.png",
  "/games/move-the-moon/assets/assets/images/desert_earth.448730f2498c1772f37d30ab3de5a766.png",
  "/games/move-the-moon/assets/assets/images/earth.e4fe8a0b43af0508eef73f143f78f5a5.png",
  "/games/move-the-moon/assets/assets/images/frozen_earth.73c68c8da257383cb8e4b2797b2c6e3e.png",
  "/games/move-the-moon/assets/assets/images/green_moon.8f91e30384b7a59202a21f83d55e460e.png",
  "/games/move-the-moon/assets/assets/images/jurassic_earth.13a8afc4f5c6d17f6b6d182cdc55b16f.png",
  "/games/move-the-moon/assets/assets/images/mineral_moon.dc7d27a41fdf0a84fce0001d792de4c4.png",
  "/games/move-the-moon/assets/assets/images/moon.ee92e93cb748f2493616f1096f8c22af.png",
  "/games/move-the-moon/assets/assets/images/ocean_earth.0c5694d950328cd905622bdaf21d0fbb.png",
  "/games/move-the-moon/assets/assets/images/orange_moon.c2cfa4aff188bb1ccbd8810cf191778a.png",
  "/games/move-the-moon/assets/assets/images/pink_earth.eaf56b2f06e7f7329ea27cbacc6057b5.png",
  "/games/move-the-moon/assets/assets/images/pink_moon.1f6cb99b0901e70e1cce6929e01258f3.png",
  "/games/move-the-moon/assets/assets/images/purple_moon.bcb18bc19cf245b527889b26289852a5.png",
  "/games/move-the-moon/assets/assets/images/sky_blue_moon.d6334bb73a2da46b920fd8b8f964eebe.png",
  "/games/move-the-moon/assets/assets/sounds/alexgrohl-relaxing-460676.39c7b745691f926aef8f0027166384d0.mp3",
  "/games/move-the-moon/assets/assets/sounds/bubblePop.9886595b0c8696d0c1e5d0b16d4fcc86.mp3",
  "/games/move-the-moon/assets/assets/sounds/buySound.ebbbc947a9c43f7bfec8d4ce1e409016.mp3",
  "/games/move-the-moon/assets/assets/sounds/coinChime.214c5844920ed39350f1cb84372add76.mp3",
  "/games/move-the-moon/assets/assets/sounds/errorSound.e2849a66fc1251390d008e2971cfd7a1.mp3",
  "/games/move-the-moon/assets/assets/sounds/gameOver.31e9259127dba423a9df12b6164142af.mp3",
  "/games/move-the-moon/assets/assets/sounds/magicTwinkle.b4908a12e7decb66a72f517717a711cb.mp3",
  "/games/move-the-moon/assets/assets/sounds/pageFlip.1373487c6f04c3c22ced59634b76767e.mp3",
  "/games/move-the-moon/assets/assets/sounds/pop.b58c83c9c481dad9e8d0742d8dd00c84.mp3",
  "/games/move-the-moon/assets/assets/sounds/powerImpact.042cf45121918d35a75d435e8674d964.mp3",
  "/games/move-the-moon/assets/assets/sounds/sillyToot.14f48cb2d47fbd9e0aa4d06f4e8d588f.mp3",
  "/games/move-the-moon/assets/assets/sounds/softBreeze.848e68101c9f743906240fde5d3ac070.mp3",
  "/games/move-the-moon/assets/assets/sounds/softClick.822939350e0561750905f91de9d468de.mp3",
  "/games/move-the-moon/assets/assets/sounds/toySqueak.681e2cd6781a31f23669cf7e79eee79d.mp3",
  "/games/move-the-moon/assets/assets/sounds/waterDrop.662a3d6e4f8698e5db06c2615929de3c.mp3",
  "/games/move-the-moon/assets/assets/sounds/wineGlass.f0539c524137d35bc5e632dd2db3b275.mp3",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/AntDesign.3f78af31cca60105799838a1a7a59fbd.ttf",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Entypo.31b5ffea3daddc69dd01a1f3d6cf63c5.ttf",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/EvilIcons.140c53a7643ea949007aa9a282153849.ttf",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Feather.ca4b48e04dc1ce10bfbddb262c8b835f.ttf",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome.b06871f281fee6b241d60582ae9369b9.ttf",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome5_Brands.3b89dd103490708d19a95adcae52210e.ttf",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome5_Regular.1f77739ca9ff2188b539c36f30ffa2be.ttf",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome5_Solid.605ed7926cf39a2ad5ec2d1f9d391d3d.ttf",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome6_Brands.56c8d80832e37783f12c05db7c8849e2.ttf",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome6_Regular.370dd5af19f8364907b6e2c41f45dbbf.ttf",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome6_Solid.adec7d6f310bc577f05e8fe06a5daccf.ttf",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Fontisto.b49ae8ab2dbccb02c4d11caaacf09eab.ttf",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Foundation.e20945d7c929279ef7a6f1db184a4470.ttf",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.b4eb097d35f44ed943676fd56f6bdc51.ttf",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.6e435534bd35da5fef04168860a9b8fa.ttf",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.4e85bc9ebe07e0340c9c4fc2f6c38908.ttf",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Octicons.871378c6eab492a3e689a9385dc45a12.ttf",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/SimpleLineIcons.d2285965fe34b05465047401b8595dd0.ttf",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Zocial.1681f34aaca71b8dfb70756bca331eb2.ttf",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@expo-google-fonts/audiowide/400Regular/Audiowide_400Regular.b32da0c186225df40f7e9dc2d5bccc38.ttf",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@expo-google-fonts/orbitron/400Regular/Orbitron_400Regular.f51de0b72e236467e71439339a673e3c.ttf",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@expo-google-fonts/orbitron/500Medium/Orbitron_500Medium.501993d0e7d27d632c7da6374307113b.ttf",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@expo-google-fonts/orbitron/600SemiBold/Orbitron_600SemiBold.f0c411b781c7967a34e2d5c3376b268e.ttf",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@expo-google-fonts/orbitron/700Bold/Orbitron_700Bold.e0d0468317d267bdcd43f1df80807eaa.ttf",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@expo-google-fonts/orbitron/800ExtraBold/Orbitron_800ExtraBold.22e4cd5d187feb1b2ba68bb4014a68b2.ttf",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@expo-google-fonts/orbitron/900Black/Orbitron_900Black.e00a0735fb6ea5b095e6de1492e0b461.ttf",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@react-navigation/elements/lib/module/assets/back-icon-mask.0a328cd9c1afd0afe8e3b1ec5165b1b4.png",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@react-navigation/elements/lib/module/assets/back-icon.35ba0eaec5a4f5ed12ca16fabeae451d.png",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@react-navigation/elements/lib/module/assets/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55.png",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@react-navigation/elements/lib/module/assets/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@2x.png",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@react-navigation/elements/lib/module/assets/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@3x.png",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@react-navigation/elements/lib/module/assets/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@4x.png",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@react-navigation/elements/lib/module/assets/close-icon.808e1b1b9b53114ec2838071a7e6daa7.png",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@react-navigation/elements/lib/module/assets/close-icon.808e1b1b9b53114ec2838071a7e6daa7@2x.png",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@react-navigation/elements/lib/module/assets/close-icon.808e1b1b9b53114ec2838071a7e6daa7@3x.png",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@react-navigation/elements/lib/module/assets/close-icon.808e1b1b9b53114ec2838071a7e6daa7@4x.png",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/@react-navigation/elements/lib/module/assets/search-icon.286d67d3f74808a60a78d3ebf1a5fb57.png",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/expo-router/assets/arrow_down.017bc6ba3fc25503e5eb5e53826d48a8.png",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/expo-router/assets/error.d1ea1496f9057eb392d5bbf3732a61b7.png",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/expo-router/assets/file.19eeb73b9593a38f8e9f418337fc7d10.png",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/expo-router/assets/forward.d8b800c443b8972542883e0b9de2bdc6.png",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/expo-router/assets/pkg.ab19f4cbc543357183a20571f68380a3.png",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/expo-router/assets/sitemap.412dd9275b6b48ad28f5e3d81bb1f626.png",
  "/games/move-the-moon/assets/___MoveTheMoon/node_modules/expo-router/assets/unmatched.20e71bdf79e3a97bf55fd9e164041578.png",
  "/games/move-the-moon/favicon.ico",
  "/games/move-the-moon/index.html",
  "/games/move-the-moon/metadata.json",
  "/games/move-the-moon/preview.png",
  "/games/move-the-moon/_expo/static/js/web/entry-181b0170ca2df73fe72af0c8b462aacd.js"
];
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(BASE);
      const page = await cache.match("/");
      const html = await page.text();
      const assets = [
        ...new Set(
          [...html.matchAll(/(?:src|href)="([^"\s]+)"/g)]
            .map((m) => m[1].replaceAll("&amp;", "&"))
            .filter((u) => u.startsWith("/_next/static/")),
        ),
      ];
      if (!assets.length) throw Error("No app assets discovered");
      await cache.addAll(assets);
      await cache.put(
        "/offline-assets",
        new Response(JSON.stringify([...BASE, ...assets])),
      );
      await self.skipWaiting();
    })(),
  );
});
self.addEventListener("activate", (event) =>
  event.waitUntil(
    (async () => {
      for (const name of await caches.keys())
        if (name.startsWith("crew-health-") && name !== CACHE)
          await caches.delete(name);
      await self.clients.claim();
    })(),
  ),
);
self.addEventListener("message", (event) => {
  if (event.data.type === "VERIFY")
    event.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE);
        const manifest = await cache.match("/offline-assets");
        let ready = false;
        if (manifest) {
          const assets = await manifest.json();
          ready = (await Promise.all(assets.map((u) => cache.match(u)))).every(
            Boolean,
          );
        }
        event.ports[0]?.postMessage({ ready });
      })(),
    );
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || event.request.method !== "GET")
    return;
  if (event.request.mode === "navigate") {
    event.respondWith(
      caches
        .open(CACHE)
        .then(
          async (cache) =>
            (await cache.match(
              (url.pathname === "/games/move-the-moon" || url.pathname.startsWith("/games/move-the-moon/"))
                ? "/games/move-the-moon/index.html"
                : "/",
            )) || fetch(event.request),
        ),
    );
    return;
  }
  if (
    url.pathname.startsWith("/_next/static/") ||
    BASE.includes(url.pathname)
  ) {
    event.respondWith(
      caches
        .open(CACHE)
        .then(
          async (cache) =>
            (await cache.match(event.request)) || fetch(event.request),
        ),
    );
  }
});
