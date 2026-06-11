<script setup lang="ts">
definePageMeta({
  layout: false,
})

useHead({
  title: 'Privacybeleid',
})
</script>

<template>
  <main class="min-h-screen bg-white px-6 py-12 text-secondary-950">
    <article class="mx-auto max-w-3xl leading-7">
      <header class="mb-10">
        <p class="mb-3 text-sm font-semibold uppercase tracking-wide text-primary-500">
          Archify
        </p>
        <h1 class="mb-2 text-4xl font-bold">
          Privacybeleid
        </h1>
        <p class="text-grey-600">
          Laatst bijgewerkt: juni 2026
        </p>
      </header>

      <p class="mb-6">
        Dit privacybeleid is van toepassing op Archify, ontwikkeld door
        CBYTE Software B.V. In dit beleid leggen we uit welke gegevens we
        verwerken, waarom we dat doen en hoe we daarmee omgaan.
      </p>

      <section class="mb-8">
        <h2 class="mb-3 text-2xl font-bold">
          1. Welke gegevens verwerken wij?
        </h2>
        <ul class="list-disc space-y-2 pl-6">
          <li>
            <strong>Accountgegevens:</strong> gebruikers loggen in via hun
            Microsoft-organisatieaccount. Archify kan hierbij naam,
            e-mailadres, organisatiegegevens en een gebruikers-ID verwerken.
          </li>
          <li>
            <strong>Gebruikerscontent:</strong> foto's, schetsen, projecten,
            comment pins en andere content die gebruikers via Archify maken of
            uploaden.
          </li>
          <li>
            <strong>Sessiegegevens:</strong> na het inloggen bewaart de app een
            sessietoken in beveiligde opslag op het apparaat om de gebruiker
            ingelogd te houden.
          </li>
        </ul>
      </section>

      <section class="mb-8">
        <h2 class="mb-3 text-2xl font-bold">
          2. Waarvoor gebruiken wij deze gegevens?
        </h2>
        <ul class="list-disc space-y-2 pl-6">
          <li>Om gebruikers toegang te geven tot Archify en hun projecten.</li>
          <li>Om foto's, schetsen en comment pins op te slaan en te tonen.</li>
          <li>Om uploads te verwerken en aan het juiste project te koppelen.</li>
          <li>Om de app en het platform correct te laten functioneren.</li>
        </ul>
        <p class="mt-4">
          Wij verkopen persoonsgegevens niet aan derden en gebruiken de gegevens
          niet voor advertenties of tracking.
        </p>
      </section>

      <section class="mb-8">
        <h2 class="mb-3 text-2xl font-bold">
          3. Microsoft als externe dienst
        </h2>
        <p>
          Archify gebruikt Microsoft Entra ID voor authenticatie. Bij het
          inloggen wordt de gebruiker doorgestuurd naar de Microsoft-login van
          de eigen organisatie. CBYTE Software B.V. heeft geen toegang tot het
          Microsoft-wachtwoord van de gebruiker.
        </p>
        <p class="mt-4">
          Meer informatie over de verwerking door Microsoft staat in het
          <a
            href="https://privacy.microsoft.com/nl-nl/privacystatement"
            class="text-primary-500 underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            privacybeleid van Microsoft
          </a>.
        </p>
      </section>

      <section class="mb-8">
        <h2 class="mb-3 text-2xl font-bold">
          4. Camera en fotobibliotheek
        </h2>
        <p>
          De mobiele app kan toegang vragen tot de camera om foto's te maken en
          tot de fotobibliotheek om bestaande foto's te selecteren. Deze toegang
          wordt alleen gebruikt voor de functies waarmee gebruikers foto's
          uploaden naar Archify.
        </p>
      </section>

      <section class="mb-8">
        <h2 class="mb-3 text-2xl font-bold">
          5. Bewaartermijn
        </h2>
        <p>
          Gegevens worden bewaard zolang dat nodig is voor het gebruik van
          Archify en zolang het account of de organisatieomgeving actief is. Als
          een account of organisatieomgeving wordt verwijderd, verwijderen we de
          bijbehorende gegevens volgens onze interne procedures en wettelijke
          verplichtingen.
        </p>
      </section>

      <section class="mb-8">
        <h2 class="mb-3 text-2xl font-bold">
          6. Opslag en beveiliging
        </h2>
        <p>
          We nemen passende technische en organisatorische maatregelen om
          persoonsgegevens te beschermen. Gegevens worden verwerkt in
          overeenstemming met de Algemene Verordening Gegevensbescherming
          (AVG/GDPR).
        </p>
      </section>

      <section class="mb-8">
        <h2 class="mb-3 text-2xl font-bold">
          7. Rechten van gebruikers
        </h2>
        <p>
          Gebruikers kunnen verzoeken om inzage, correctie of verwijdering van
          hun persoonsgegevens. Ook kunnen gebruikers bezwaar maken tegen de
          verwerking van persoonsgegevens wanneer daarvoor een wettelijke grond
          bestaat.
        </p>
      </section>

      <section class="mb-8">
        <h2 class="mb-3 text-2xl font-bold">
          8. Wijzigingen
        </h2>
        <p>
          We kunnen dit privacybeleid aanpassen. De meest recente versie is
          altijd beschikbaar op deze pagina.
        </p>
      </section>

      <section>
        <h2 class="mb-3 text-2xl font-bold">
          9. Contact
        </h2>
        <p>
          Vragen over dit privacybeleid kunnen worden gestuurd naar:
        </p>
        <p class="mt-4">
          CBYTE Software B.V.<br>
          <a href="mailto:info@cbyte.digital" class="text-primary-500 underline">
            info@cbyte.digital
          </a><br>
          <a
            href="https://cbyte.digital"
            class="text-primary-500 underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            cbyte.digital
          </a>
        </p>
      </section>
    </article>
  </main>
</template>
