import { Routes } from "@angular/router";
import { NotificationHomeComponent } from "./notification-home/notification-home.component";
import { AllNotificationComponent } from "./components/all-notification/all-notification.component";
import { NotificationComponent } from "./components/notification/notification.component";
import { PostNotificationAdminComponent } from "./components/post-notification-admin/post-notification-admin.component";
import { UsersNavbarComponent } from "./components/users-navbar/users-navbar.component";
import { roleGuard } from "./guard";

export const NOTIFICATION_ROUTES: Routes = [
    { path: '', component: NotificationHomeComponent },
    { path: "", redirectTo: "/home", pathMatch: "full" },

  {
    path: "home", component: UsersNavbarComponent,
    children: [
      { path: "notifications/:rol", component: NotificationComponent },
      {
        path: "admin-post-notification",
        component: PostNotificationAdminComponent,
      },
      { path: "admin-all-notifications", component: AllNotificationComponent,canActivate: [roleGuard] },
    ],
  },
  {path: "allNotification", component: AllNotificationComponent},
    
];