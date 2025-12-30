export function TermsPage() {
  return (
    <div className="legal-page">
      <header>
        <h1>Conditions générales de vente</h1>
        <p>
          Document de référence pour les prestations de traiteur réalisées par Vite & Gourmand
          (version 1.6 — janvier 2025).
        </p>
      </header>

      <section>
        <h2>1. Commande</h2>
        <p>
          Toute commande est ferme après signature du devis et versement d’un acompte de 40%. Le solde
          est exigible à la livraison de la prestation. Les menus peuvent être ajustés jusqu’à J-5.
        </p>
      </section>

      <section>
        <h2>2. Conditions d’annulation</h2>
        <ul>
          <li>Annulation à plus de 15 jours : remboursement intégral de l’acompte.</li>
          <li>Annulation entre J-15 et J-5 : 50% du montant total reste dû.</li>
          <li>Annulation à moins de 5 jours : 100% du montant total reste dû.</li>
        </ul>
      </section>

      <section>
        <h2>3. Allergènes & régimes spécifiques</h2>
        <p>
          Les allergènes sont indiqués sur chaque fiche menu. Le client doit informer Vite & Gourmand
          des restrictions alimentaires au minimum 7 jours avant la prestation. Toute modification
  tardive peut entraîner des frais supplémentaires.
        </p>
      </section>

      <section>
        <h2>4. Logistique & responsabilités</h2>
        <p>
          Le client doit garantir un accès facile au lieu, des prises électriques conformes et un espace
          de préparation propre. Vite & Gourmand se réserve le droit d’interrompre la prestation en cas
          de non-respect des normes sanitaires. Les contenants consignés doivent être restitués sous 72h.
        </p>
      </section>

      <section>
        <h2>5. Protection des données</h2>
        <p>
          Les données clients sont utilisées uniquement pour la réalisation des prestations et la
          facturation. Elles ne sont pas communiquées à des tiers. Le client peut demander la suppression
          ou la portabilité de ses données conformément au RGPD.
        </p>
      </section>

      <section>
        <h2>6. Litiges</h2>
        <p>
          En cas de litige, le client peut saisir le médiateur de la consommation : Médiation Toursime
          Voyage, BP 80 303, 75823 Paris Cedex 17. À défaut de médiation, le Tribunal de commerce de
          Bordeaux est compétent.
        </p>
      </section>

      <section>
        <h2>Téléchargements</h2>
        <ul>
          <li>
            <a href="/docs/cgv-vite-gourmand.pdf" download>
              Télécharger les CGV (PDF)
            </a>
          </li>
          <li>
            <a href="/docs/charte-hygiene.pdf" download>
              Télécharger la charte hygiène & sécurité (PDF)
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}

