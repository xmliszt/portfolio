---
id: restart-after-sync
title: Pourquoi dois-je redémarrer l’app après avoir activé la synchro ?
order: 3
---

Joodle utilise SwiftData d’Apple avec CloudKit pour synchroniser vos données de manière sécurisée. En raison du fonctionnement de cette technologie, la configuration de synchro est définie au lancement de l’app.

**Quand vous changez les réglages de synchro**, l’app doit redémarrer pour appliquer correctement la nouvelle configuration. Cela garantit :

- Une synchronisation fiable de vos données.
- L’absence de conflit entre les données locales et cloud.
- Un établissement correct de la connexion de synchronisation.

Ce redémarrage est nécessaire une seule fois à chaque activation/désactivation de la synchro. Ensuite, la synchronisation se fait automatiquement en arrière-plan.
