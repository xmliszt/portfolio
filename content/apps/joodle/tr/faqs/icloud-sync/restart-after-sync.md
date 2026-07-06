---
id: restart-after-sync
title: Eşitlemeyi açtıktan sonra neden uygulamayı yeniden başlatmam gerekiyor?
order: 3
---

Joodle, verilerini güvenle eşitlemek için Apple'ın SwiftData ve CloudKit teknolojisini kullanır. Apple'ın eşitleme teknolojisinin çalışma biçimi nedeniyle, eşitleme yapılandırması uygulama başlatıldığında ayarlanır.

**Eşitleme ayarlarını değiştirdiğinde**, yeni yapılandırmayı düzgün uygulamak için uygulamanın yeniden başlaması gerekir. Bu şunları sağlar:

- Verilerin güvenilir biçimde eşitlenir.
- Yerel ve buluttaki veriler arasında çakışma olmaz.
- Eşitleme bağlantısı doğru biçimde kurulur.

Eşitlemeyi her açıp kapattığında bu yalnızca bir kez gerçekleşen bir yeniden başlatmadır. Bundan sonra eşitleme arka planda otomatik olarak gerçekleşir.
