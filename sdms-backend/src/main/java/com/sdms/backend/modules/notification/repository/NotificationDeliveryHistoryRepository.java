package com.sdms.backend.modules.notification.repository;

import com.sdms.backend.modules.notification.entity.NotificationDeliveryHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationDeliveryHistoryRepository extends JpaRepository<NotificationDeliveryHistory, Long>, JpaSpecificationExecutor<NotificationDeliveryHistory> {
}