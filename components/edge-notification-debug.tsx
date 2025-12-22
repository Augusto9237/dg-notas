'use client'

import { useState, useEffect, useCallback } from 'react';

interface SystemStatus {
    isSecure?: boolean;
    hasSW?: boolean;
    hasPush?: boolean;
    hasNotification?: boolean;
    permission?: NotificationPermission | 'N/A';
    userAgent?: string;
    https?: boolean;
    swSupported?: boolean;
    pushSupported?: boolean;
    notificationSupported?: boolean;
    swRegistered?: boolean;
    swActive?: boolean;
    hasSubscription?: boolean;
    isEdge?: boolean;
}

interface TestResults {
    teste1?: string;
    teste2?: string;
    teste3?: string;
    teste4?: string;
    [key: string]: string | undefined;
}

interface LogEntry {
    msg: string;
    type: string;
}

export default function DiagnosticoCompleto() {
    const [status, setStatus] = useState<SystemStatus>({});
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [testResults, setTestResults] = useState<TestResults>({});

    const log = (msg: string, type: string = 'info') => {
        setLogs(prev => [{ msg: `${new Date().toLocaleTimeString()} - ${msg}`, type }, ...prev]);
        console.log(`[${type}] ${msg}`);
    };

    const checkStatus = useCallback(async () => {
        if (typeof window === 'undefined') return;

        const info: SystemStatus = {
            isSecure: window.isSecureContext,
            hasSW: 'serviceWorker' in navigator,
            hasPush: 'PushManager' in window,
            hasNotification: 'Notification' in window,
            permission: 'Notification' in window ? Notification.permission : 'N/A',
            userAgent: navigator.userAgent,
            https: window.location.protocol === 'https:',
            swSupported: 'serviceWorker' in navigator,
            pushSupported: 'PushManager' in window,
            notificationSupported: 'Notification' in window,
            swRegistered: false,
            swActive: false,
            hasSubscription: false,
            isEdge: /Edg/.test(navigator.userAgent)
        };

        try {
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                info.swRegistered = registrations.length > 0;

                if (registrations.length > 0) {
                    info.swActive = registrations[0].active?.state === 'activated';
                    const sub = await registrations[0].pushManager.getSubscription();
                    info.hasSubscription = !!sub;
                }
            }
        } catch (error: unknown) {
            const errMsg = error instanceof Error ? error.message : String(error);
            log(`Erro ao verificar status: ${errMsg}`, 'error');
        }

        setStatus(info);
        log('Status verificad');
    }, []); // Empty dependency array as log is stable (though ideally log should be wrapped too or ignored)

    useEffect(() => {
        checkStatus();

        // Listen for SW messages
        if ('serviceWorker' in navigator) {
            const messageHandler = (event: MessageEvent) => {
                log(`SW Message: ${JSON.stringify(event.data)}`);
            };
            navigator.serviceWorker.addEventListener('message', messageHandler);
            return () => navigator.serviceWorker.removeEventListener('message', messageHandler);
        }
    }, [checkStatus]);

    const teste1_NotificacaoDireta = async () => {
        log('=== TESTE 1: Notification API Direta ===', 'info');

        try {
            if (!('Notification' in window)) {
                log('Notification API não suportada', 'error');
                return;
            }

            if (Notification.permission !== 'granted') {
                log('Solicitando permissão...', 'warning');
                const perm = await Notification.requestPermission();
                if (perm !== 'granted') {
                    log('Permissão negada!', 'error');
                    setTestResults(prev => ({ ...prev, teste1: 'FALHOU' }));
                    return;
                }
            }

            log('Criando notificação direta...', 'info');
            const notification = new Notification('🔵 TESTE 1: Notificação Direta', {
                body: 'Se você vê isso, a Notification API funciona!',
                icon: '/Simbolo1.png',
                requireInteraction: true,
                tag: 'test-1-' + Date.now()
            });

            notification.onshow = () => {
                log('✅ TESTE 1: PASSOU - Notificação exibida!', 'success');
                setTestResults(prev => ({ ...prev, teste1: 'PASSOU' }));
            };

            notification.onerror = () => {
                log('❌ TESTE 1: FALHOU - Erro ao exibir', 'error');
                setTestResults(prev => ({ ...prev, teste1: 'FALHOU' }));
            };

            // Timeout para verificar
            setTimeout(() => {
                // Check current results carefully - relying on closure here might be stale but intent is check existence
                setTestResults(current => {
                    if (!current.teste1) {
                        log('⚠️ TESTE 1: Não confirmado em 2s', 'warning');
                    }
                    return current;
                });
            }, 2000);

        } catch (error: unknown) {
            const errMsg = error instanceof Error ? error.message : String(error);
            log(`❌ TESTE 1: FALHOU - ${errMsg}`, 'error');
            setTestResults(prev => ({ ...prev, teste1: 'FALHOU' }));
        }
    };

    const teste2_ServiceWorkerLocal = async () => {
        log('=== TESTE 2: Service Worker (Local) ===', 'info');

        try {
            if (!navigator.serviceWorker) {
                log('❌ Service Worker não suportado', 'error');
                return;
            }
            const registration = await navigator.serviceWorker.ready;

            if (!registration.active) {
                log('❌ Service Worker não está ativo!', 'error');
                setTestResults(prev => ({ ...prev, teste2: 'FALHOU' }));
                return;
            }

            log('Service Worker ativo, criando notificação...', 'info');

            await registration.showNotification('🟢 TESTE 2: Via Service Worker', {
                body: 'Se você vê isso, o SW funciona!',
                icon: '/Simbolo1.png',
                badge: '/Simbolo1.png',
                tag: 'test-2-' + Date.now(),
                requireInteraction: true,
                silent: false
            });

            log('✅ TESTE 2: PASSOU - showNotification chamado', 'success');
            setTestResults(prev => ({ ...prev, teste2: 'PASSOU' }));

        } catch (error: unknown) {
            const errMsg = error instanceof Error ? error.message : String(error);
            log(`❌ TESTE 2: FALHOU - ${errMsg}`, 'error');
            setTestResults(prev => ({ ...prev, teste2: 'FALHOU' }));
        }
    };

    const teste3_PushSimulado = async () => {
        log('=== TESTE 3: Push Simulado ===', 'info');

        try {
            if (!navigator.serviceWorker) return;
            const registration = await navigator.serviceWorker.ready;

            if (!registration.active) {
                log('❌ Service Worker não está ativo!', 'error');
                setTestResults(prev => ({ ...prev, teste3: 'FALHOU' }));
                return;
            }

            log('Enviando mensagem para SW simular push...', 'info');

            // Listener para resposta do SW
            const handler = (event: MessageEvent) => {
                const data = event.data;
                if (data?.type === 'TEST_PUSH_SUCCESS') {
                    log('✅ TESTE 3: PASSOU - SW confirmou exibição', 'success');
                    setTestResults(prev => ({ ...prev, teste3: 'PASSOU' }));
                    navigator.serviceWorker.removeEventListener('message', handler);
                } else if (data?.type === 'TEST_PUSH_ERROR') {
                    log(`❌ TESTE 3: FALHOU - ${data.error}`, 'error');
                    setTestResults(prev => ({ ...prev, teste3: 'FALHOU' }));
                    navigator.serviceWorker.removeEventListener('message', handler);
                }
            };

            navigator.serviceWorker.addEventListener('message', handler);

            registration.active.postMessage({
                type: 'TEST_PUSH',
                data: {
                    title: '🟡 TESTE 3: Push Simulado',
                    body: 'Se você vê isso, o handler de push funciona!',
                    icon: '/Simbolo1.png'
                }
            });

            setTimeout(() => {
                // Remove listener to avoid leaks if it never fires
                navigator.serviceWorker.removeEventListener('message', handler);
            }, 5000);

        } catch (error: unknown) {
            const errMsg = error instanceof Error ? error.message : String(error);
            log(`❌ TESTE 3: FALHOU - ${errMsg}`, 'error');
            setTestResults(prev => ({ ...prev, teste3: 'FALHOU' }));
        }
    };

    const teste4_PushReal = async () => {
        log('=== TESTE 4: Push Real (Servidor) ===', 'info');

        try {
            if (!navigator.serviceWorker) return;
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (!subscription) {
                log('❌ Nenhuma subscription ativa!', 'error');
                setTestResults(prev => ({ ...prev, teste4: 'FALHOU' }));
                return;
            }

            log('Enviando push via servidor...', 'info');
            // Tipando subscription.endpoint como string, que é o que ele é.
            log(`Endpoint: ${subscription.endpoint.substring(0, 50)}...`, 'info');

            const response = await fetch('/api/notificacoes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscriptions: [subscription.toJSON()],
                    payload: {
                        title: '🔴 TESTE 4: Push Real',
                        body: 'Se você vê isso, push do servidor funciona!',
                        icon: '/Simbolo1.png',
                        badge: '/Simbolo1.png',
                        requireInteraction: true,
                        vibrate: [300, 100, 300],
                        tag: 'test-4-' + Date.now()
                    }
                })
            });

            const result = await response.json();
            log(`Resposta do servidor: ${JSON.stringify(result)}`, 'info');

            if (result.successCount > 0) {
                log('✅ TESTE 4: Servidor enviou com sucesso!', 'success');
                log('⏳ Aguarde 2-5 segundos para notificação chegar...', 'warning');
                setTestResults(prev => ({ ...prev, teste4: 'ENVIADO' }));
            } else {
                log('❌ TESTE 4: FALHOU - Servidor não enviou', 'error');
                setTestResults(prev => ({ ...prev, teste4: 'FALHOU' }));
            }

        } catch (error: unknown) {
            const errMsg = error instanceof Error ? error.message : String(error);
            log(`❌ TESTE 4: FALHOU - ${errMsg}`, 'error');
            setTestResults(prev => ({ ...prev, teste4: 'FALHOU' }));
        }
    };

    const executarTodosTestes = async () => {
        setLogs([]);
        setTestResults({});

        log('🚀 Iniciando bateria de testes...', 'info');

        await teste1_NotificacaoDireta();
        await new Promise(r => setTimeout(r, 2000));

        await teste2_ServiceWorkerLocal();
        await new Promise(r => setTimeout(r, 2000));

        await teste3_PushSimulado();
        await new Promise(r => setTimeout(r, 3000));

        await teste4_PushReal();

        log('🏁 Bateria de testes concluída', 'info');
    };

    const verificarConfiguracoes = () => {
        log('=== VERIFICANDO CONFIGURAÇÕES ===', 'info');
        log(`HTTPS: ${status.https ? '✅' : '❌'}`, status.https ? 'success' : 'error');
        log(`Service Worker: ${status.swSupported ? '✅' : '❌'}`, status.swSupported ? 'success' : 'error');
        log(`Push Manager: ${status.pushSupported ? '✅' : '❌'}`, status.pushSupported ? 'success' : 'error');
        log(`Notifications: ${status.notificationSupported ? '✅' : '❌'}`, status.notificationSupported ? 'success' : 'error');
        log(`Permissão: ${status.permission}`, status.permission === 'granted' ? 'success' : 'error');
        log(`SW Registrado: ${status.swRegistered ? '✅' : '❌'}`, status.swRegistered ? 'success' : 'error');
        log(`SW Ativo: ${status.swActive ? '✅' : '❌'}`, status.swActive ? 'success' : 'error');
        log(`Subscription: ${status.hasSubscription ? '✅' : '❌'}`, status.hasSubscription ? 'success' : 'error');
        log(`Edge: ${status.isEdge ? '✅' : '❌'}`, 'info');
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui' }}>
            <h1>🔍 Diagnóstico Completo de Notificações</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div style={cardStyle}>
                    <h3>📊 Status do Sistema</h3>
                    <table style={{ width: '100%', fontSize: '14px' }}>
                        <tbody>
                            <tr><td>HTTPS:</td><td>{status.https ? '✅' : '❌'}</td></tr>
                            <tr><td>Service Worker:</td><td>{status.swSupported ? '✅' : '❌'}</td></tr>
                            <tr><td>Push Manager:</td><td>{status.pushSupported ? '✅' : '❌'}</td></tr>
                            <tr><td>Permissão:</td><td style={{ fontWeight: 'bold', color: status.permission === 'granted' ? 'green' : 'red' }}>{status.permission}</td></tr>
                            <tr><td>SW Registrado:</td><td>{status.swRegistered ? '✅' : '❌'}</td></tr>
                            <tr><td>SW Ativo:</td><td>{status.swActive ? '✅' : '❌'}</td></tr>
                            <tr><td>Subscription:</td><td>{status.hasSubscription ? '✅' : '❌'}</td></tr>
                            <tr><td>Edge:</td><td>{status.isEdge ? '✅' : '❌'}</td></tr>
                        </tbody>
                    </table>
                </div>

                <div style={cardStyle}>
                    <h3>🧪 Resultados dos Testes</h3>
                    <div style={{ fontSize: '14px' }}>
                        <div>TESTE 1 (Direto): <span style={{ fontWeight: 'bold', color: getColor(testResults.teste1) }}>{testResults.teste1 || 'Pendente'}</span></div>
                        <div>TESTE 2 (SW Local): <span style={{ fontWeight: 'bold', color: getColor(testResults.teste2) }}>{testResults.teste2 || 'Pendente'}</span></div>
                        <div>TESTE 3 (Push Simulado): <span style={{ fontWeight: 'bold', color: getColor(testResults.teste3) }}>{testResults.teste3 || 'Pendente'}</span></div>
                        <div>TESTE 4 (Push Real): <span style={{ fontWeight: 'bold', color: getColor(testResults.teste4) }}>{testResults.teste4 || 'Pendente'}</span></div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                <button onClick={verificarConfiguracoes} style={buttonStyle}>🔍 Verificar Config</button>
                <button onClick={teste1_NotificacaoDireta} style={{ ...buttonStyle, background: '#007bff' }}>1️⃣ Teste Direto</button>
                <button onClick={teste2_ServiceWorkerLocal} style={{ ...buttonStyle, background: '#28a745' }}>2️⃣ Teste SW</button>
                <button onClick={teste3_PushSimulado} style={{ ...buttonStyle, background: '#ffc107', color: '#000' }}>3️⃣ Push Simulado</button>
                <button onClick={teste4_PushReal} style={{ ...buttonStyle, background: '#dc3545' }}>4️⃣ Push Real</button>
                <button onClick={executarTodosTestes} style={{ ...buttonStyle, background: '#6f42c1' }}>🚀 Todos os Testes</button>
                <button onClick={() => { setLogs([]); setTestResults({}); }} style={{ ...buttonStyle, background: '#6c757d' }}>🗑️ Limpar</button>
            </div>

            <div style={cardStyle}>
                <h3>📋 Logs ({logs.length})</h3>
                <div style={{ maxHeight: '400px', overflow: 'auto', background: '#1e1e1e', padding: '10px', borderRadius: '4px' }}>
                    {logs.map((log, i) => (
                        <div key={i} style={{
                            color: log.type === 'error' ? '#ff6b6b' :
                                log.type === 'success' ? '#51cf66' :
                                    log.type === 'warning' ? '#ffd43b' : '#a0a0a0',
                            fontSize: '13px',
                            fontFamily: 'monospace',
                            marginBottom: '5px'
                        }}>
                            {log.msg}
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ ...cardStyle, background: '#fff3cd', marginTop: '20px' }}>
                <h3>📖 Interpretação dos Resultados</h3>
                <ul style={{ lineHeight: '1.8', fontSize: '14px' }}>
                    <li><strong>TESTE 1 FALHOU:</strong> Problema nas configurações do Windows/Edge</li>
                    <li><strong>TESTE 2 FALHOU (mas 1 passou):</strong> Problema no Service Worker</li>
                    <li><strong>TESTE 3 FALHOU (mas 1-2 passaram):</strong> Problema no handler de push do SW</li>
                    <li><strong>TESTE 4 FALHOU (mas 1-3 passaram):</strong> Problema no servidor ou HTTPS</li>
                    <li><strong>TODOS PASSAM mas não vê popup:</strong> Configurações de banner do Windows</li>
                </ul>
            </div>
        </div>
    );
}

const getColor = (result: string | undefined) => {
    if (!result) return 'gray';
    if (result === 'PASSOU') return '#51cf66';
    if (result === 'ENVIADO') return '#ffd43b';
    return '#ff6b6b';
};

const buttonStyle: React.CSSProperties = {
    padding: '10px',
    border: 'none',
    borderRadius: '4px',
    background: '#0078d4',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
};

const cardStyle: React.CSSProperties = {
    background: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    padding: '15px'
};