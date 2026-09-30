/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import type { AppRoute, UserProfile } from './types.ts';
import { ToastProvider } from './components/ui/Toast.tsx';
import { GlobalLayout } from './components/layout/GlobalLayout.tsx';
import { LoginPage } from './views/LoginPage.tsx';
import { DashboardView } from './views/DashboardView.tsx';
import { DesignSystemView } from './views/DesignSystemView.tsx';
import { MeetingModuleView } from './views/MeetingModuleView.tsx';
import { StrategyModuleView } from './views/StrategyModuleView.tsx';
import { AcademicManagementModule } from './components/academic/AcademicManagementModule.tsx';
import { FacultyManagementModule } from './components/faculty/FacultyManagementModule.tsx';
import { RegulatoryManagementModule } from './components/regulatory/RegulatoryManagementModule.tsx';
import { OnlineFormsModule } from './components/forms/OnlineFormsModule.tsx';
import { DocumentCenterModule } from './components/documents/DocumentCenterModule.tsx';
import { ReportsView } from './views/ReportsView.tsx';
import { IntegrationsView } from './views/IntegrationsView.tsx';
import { UserManagementView } from './views/UserManagementView.tsx';
import { RoleManagementView } from './views/RoleManagementView.tsx';
import { WorkflowManagementView } from './views/WorkflowManagementView.tsx';
import { CalendarView } from './views/CalendarView.tsx';
import { MyWorkView } from './views/MyWorkView.tsx';
import { NotificationSettingsView } from './views/NotificationSettingsView.tsx';
import { ModulePlaceholderView } from './views/ModulePlaceholderView.tsx';
import { SystemHealthView } from './views/SystemHealthView.tsx';
import { DataManagementView } from './views/DataManagementView.tsx';
import { MasterDataView } from './views/MasterDataView.tsx';
import { SettingsHubView } from './views/SettingsHubView.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.tsx';
import { UnauthorizedState } from './components/common/UnauthorizedState.tsx';
import { RoleSwitcherModal } from './components/common/RoleSwitcherModal.tsx';
import { MODULE_CONFIGS } from './data/modulesConfig.tsx';
import { rbacService, DEMO_PERSONAS } from './services/rbacService.ts';

const DEFAULT_USER: UserProfile = {
  id: 'usr-1',
  name: 'พระมหาวรเชษฐ์ สุเมโธ, ผศ.ดร.',
  role: 'หัวหน้ากอง',
  position: 'ผู้อำนวยการกองวิชาการ สำนักงานอธิการบดี',
  department: 'กองวิชาการ สำนักงานอธิการบดี',
  email: 'academic.director@mcu.ac.th',
  initials: 'ผอ',
};

export default function App() {
  // Simple URL hash synchronization for smooth navigation & preview
  const getInitialRoute = (): AppRoute => {
    const hash = window.location.hash.replace('#', '');
    const validRoutes: AppRoute[] = [
      '/login',
      '/dashboard',
      '/my-work',
      '/calendar',
      '/meetings',
      '/strategy',
      '/collaboration',
      '/courses',
      '/pre-degree',
      '/credit-bank',
      '/faculty',
      '/regulatory',
      '/forms',
      '/documents',
      '/reports',
      '/users',
      '/settings/roles',
      '/settings/notifications',
      '/admin/system-health',
      '/data-management',
      '/import',
      '/master-data',
      '/workflows',
      '/integrations',
      '/settings',
      '/design-system',
    ];
    if (validRoutes.includes(hash as AppRoute)) {
      return hash as AppRoute;
    }
    return '/dashboard';
  };

  const [currentRoute, setCurrentRoute] = useState<AppRoute>(getInitialRoute);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(DEFAULT_USER);
  const [isRoleSwitcherModalOpen, setIsRoleSwitcherModalOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as AppRoute;
      if (hash) {
        setCurrentRoute(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (route: AppRoute) => {
    setCurrentRoute(route);
    window.location.hash = route;
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    handleNavigate('/dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    handleNavigate('/login');
  };

  // Render view depending on routing with RBAC Route Guard
  const renderCurrentView = () => {
    // 1. Check Route-level permissions
    const isExemptRoute =
      currentRoute === '/dashboard' ||
      currentRoute === '/login' ||
      currentRoute === '/design-system';

    if (!isExemptRoute && currentUser) {
      const canAccess = rbacService.canRoute(currentUser, currentRoute);
      if (!canAccess) {
        const requiredPermission = rbacService.getRequiredPermissionForRoute(currentRoute);
        return (
          <UnauthorizedState
            type="403"
            user={currentUser}
            requiredPermission={requiredPermission}
            targetRoute={currentRoute}
            onNavigate={handleNavigate}
            onOpenRoleSwitcher={() => setIsRoleSwitcherModalOpen(true)}
          />
        );
      }
    }

    if (currentRoute === '/dashboard') {
      return <DashboardView onNavigate={handleNavigate} />;
    }

    if (currentRoute === '/my-work') {
      return <MyWorkView currentUser={currentUser} onNavigate={handleNavigate} />;
    }

    if (currentRoute === '/calendar') {
      return <CalendarView onNavigate={handleNavigate} />;
    }

    if (currentRoute === '/settings/notifications') {
      return <NotificationSettingsView onNavigate={handleNavigate} />;
    }

    if (currentRoute === '/meetings') {
      return (
        <MeetingModuleView
          onNavigate={handleNavigate}
          currentUser={currentUser || undefined}
        />
      );
    }

    if (currentRoute === '/strategy') {
      return <StrategyModuleView onNavigate={handleNavigate} />;
    }

    if (currentRoute === '/collaboration') {
      return <AcademicManagementModule key="collaboration" initialSubTab="partners" />;
    }

    if (currentRoute === '/courses') {
      return <AcademicManagementModule key="courses" initialSubTab="short_course" />;
    }

    if (currentRoute === '/pre-degree') {
      return <AcademicManagementModule key="pre-degree" initialSubTab="pre_degree" />;
    }

    if (currentRoute === '/credit-bank') {
      return <AcademicManagementModule key="credit-bank" initialSubTab="credit_bank" />;
    }

    if (currentRoute === '/faculty') {
      return <FacultyManagementModule />;
    }

    if (currentRoute === '/regulatory') {
      return <RegulatoryManagementModule />;
    }

    if (currentRoute === '/forms') {
      return <OnlineFormsModule />;
    }

    if (currentRoute === '/documents') {
      return (
        <DocumentCenterModule
          onNavigateToModule={(targetPath) => handleNavigate(targetPath as AppRoute)}
        />
      );
    }

    if (currentRoute === '/reports') {
      return <ReportsView currentUser={currentUser || undefined} />;
    }

    if (currentRoute === '/users') {
      return <UserManagementView currentUser={currentUser || undefined} />;
    }

    if (currentRoute === '/settings/roles') {
      return <RoleManagementView currentUser={currentUser || undefined} />;
    }

    if (currentRoute === '/workflows') {
      return (
        <WorkflowManagementView
          currentUser={currentUser!}
          onNavigate={handleNavigate}
          onSwitchPersona={(roleName) => {
            const persona = DEMO_PERSONAS[roleName];
            if (persona) setCurrentUser(persona);
          }}
        />
      );
    }

    if (currentRoute === '/admin/system-health') {
      return <SystemHealthView user={currentUser || undefined} />;
    }

    if (currentRoute === '/import') {
      return (
        <DataManagementView
          key="import"
          initialTab="import_data"
          currentUser={currentUser}
          onNavigate={handleNavigate}
        />
      );
    }

    if (currentRoute === '/data-management') {
      return (
        <DataManagementView
          key="data-management"
          initialTab="stats"
          currentUser={currentUser}
          onNavigate={handleNavigate}
        />
      );
    }

    if (currentRoute === '/master-data') {
      return <MasterDataView currentUser={currentUser!} />;
    }

    if (currentRoute === '/integrations') {
      return <IntegrationsView />;
    }

    if (currentRoute === '/settings') {
      return <SettingsHubView currentUser={currentUser} onNavigate={handleNavigate} />;
    }

    if (currentRoute === '/design-system') {
      return <DesignSystemView />;
    }

    // Extract module key (e.g. '/meetings' -> 'meetings', '/credit-bank' -> 'credit-bank')
    const moduleKey = currentRoute.replace('/', '');
    const moduleConfig = MODULE_CONFIGS[moduleKey];

    if (moduleConfig) {
      return <ModulePlaceholderView route={currentRoute} config={moduleConfig} />;
    }

    // Fallback to Dashboard
    return <DashboardView onNavigate={handleNavigate} />;
  };

  // If user is logged out or route is explicitly '/login'
  if (!currentUser || currentRoute === '/login') {
    return (
      <ToastProvider>
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <GlobalLayout
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        user={currentUser}
        onLogout={handleLogout}
        onSwitchUser={setCurrentUser}
      >
        <ErrorBoundary>
          {renderCurrentView()}
        </ErrorBoundary>
      </GlobalLayout>

      {/* Role Switcher Modal accessible from 403 screen or topnav */}
      {isRoleSwitcherModalOpen && (
        <RoleSwitcherModal
          isOpen={isRoleSwitcherModalOpen}
          onClose={() => setIsRoleSwitcherModalOpen(false)}
          currentUser={currentUser}
          onSelectRole={(user) => {
            setCurrentUser(user);
            setIsRoleSwitcherModalOpen(false);
          }}
        />
      )}
    </ToastProvider>
  );
}
