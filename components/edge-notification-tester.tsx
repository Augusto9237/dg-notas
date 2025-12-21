'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function EdgeNotificationTester() {
    const [logs, setLogs] = useState<string[]>([])
    const [swVersion, setSwVersion] = useState<string>('unknown')
    const [isEdge, setIsEdge] = useState(false)
    const [permission, setPermission] = useState<NotificationPermission>('default')
    const [subscription, setSubscription] = useState<PushSubscription | null>(null)

    useEffect(() => {
        // Detecta Edge
        const edge = /Edg/.test(navigator.userAgent)
        setIsEdge(edge)
        addLog(`🌐 Navegador: ${edge ? 'Microsoft Edge' : 'Outro'}`)

        // Verifica permissão
        if ('Notification' in window) {
            setPermission(Notification.permission)
            addLog(`🔔 Permissão: ${Notification.permission}`)
        }

        // Verifica service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(reg => {
                addLog('✅ Service Worker ativo')

                // Pega subscription
                reg.pushManager.getSubscription().then(sub => {
                    setSubscription(sub)
                    if (sub) {
                        addLog(`📱 Subscription ativa: ${sub.endpoint.substring(0, 50)}...`)
                    } else {
                        addLog('⚠️ Nenhuma subscription ativa')
                    }
                })
            })

            // Escuta mensagens do SW
            navigator.serviceWorker.addEventListener('message', (event) => {
                addLog(`📨 SW Message: ${JSON.stringify(event.data)}`)
                if (event.data.version) {
                    setSwVersion(event.data.version)
                }
            })
        }
    }, [])

    const addLog = (msg: string) => {
        const timestamp = new Date().toLocaleTimeString()
        setLogs(prev => [`[${timestamp}] ${msg}`, ...prev].slice(0, 20))
    }

    const requestPermission = async () => {
        try {
            const result = await Notification.requestPermission()
            setPermission(result)
            addLog(`🔔 Permissão ${result === 'granted' ? 'concedida' : 'negada'}`)
        } catch (error) {
            addLog(`❌ Erro ao solicitar permissão: ${error}`)
        }
    }

    const testLocalNotification = async () => {
        if (permission !== 'granted') {
            addLog('❌ Permissão não concedida')
            return
        }

        try {
            const reg = await navigator.serviceWorker.ready
            await reg.showNotification('Teste Local', {
                body: 'Notificação de teste local (não via push)',
                icon: '/Símbolo1.png',
                badge: '/Símbolo1.png',
                tag: 'test-local-' + Date.now(),
                requireInteraction: true,
                data: { url: '/', test: true }
            } as NotificationOptions)
            addLog('✅ Notificação local enviada')
        } catch (error) {
            addLog(`❌ Erro: ${error}`)
        }
    }

    const testPushSimulation = async () => {
        if (!('serviceWorker' in navigator)) {
            addLog('❌ Service Worker não suportado')
            return
        }

        try {
            const reg = await navigator.serviceWorker.ready
            if (!reg.active) {
                addLog('❌ Service Worker não está ativo')
                return
            }

            // Envia mensagem para o SW simular um push
            reg.active.postMessage({
                type: 'TEST_PUSH',
                data: {
                    title: 'Teste Push Simulado',
                    body: 'Esta é uma notificação de teste via mensagem ao SW',
                    requireInteraction: true,
                    vibrate: [300, 100, 300]
                }
            })
            addLog('📤 Mensagem de teste enviada ao SW')
        } catch (error) {
            addLog(`❌ Erro: ${error}`)
        }
    }

    const testRealPush = async () => {
        try {
            addLog('📤 Enviando push real via API...')
            const session = await fetch('/api/auth/get-session').then(r => r.json())

            if (!session?.user?.id) {
                addLog('❌ Usuário não autenticado')
                return
            }

            const response = await fetch('/api/test-push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: session.user.id })
            })

            const data = await response.json()

            if (response.ok) {
                addLog('✅ Push enviado com sucesso!')
                addLog(`📊 Resultados: ${JSON.stringify(data.results)}`)
            } else {
                addLog(`❌ Erro: ${data.error}`)
            }
        } catch (error) {
            addLog(`❌ Erro: ${error}`)
        }
    }

    const checkSwVersion = async () => {
        try {
            const reg = await navigator.serviceWorker.ready
            if (reg.active) {
                reg.active.postMessage({ type: 'GET_VERSION' })
                addLog('📤 Solicitando versão do SW...')
            }
        } catch (error) {
            addLog(`❌ Erro: ${error}`)
        }
    }

    const unregisterSW = async () => {
        try {
            const regs = await navigator.serviceWorker.getRegistrations()
            for (const reg of regs) {
                await reg.unregister()
                addLog('🗑️ Service Worker removido')
            }
            addLog('✅ Recarregue a página para registrar novo SW')
        } catch (error) {
            addLog(`❌ Erro: ${error}`)
        }
    }

    const checkSubscriptions = async () => {
        try {
            addLog('🔍 Verificando subscriptions...')
            const session = await fetch('/api/auth/get-session').then(r => r.json())

            if (!session?.user?.id) {
                addLog('❌ Usuário não autenticado')
                return
            }

            const response = await fetch('/api/check-subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: session.user.id })
            })

            const data = await response.json()

            if (response.ok) {
                addLog(`📊 Total: ${data.totalSubscriptions} subscription(s)`)
                data.subscriptions.forEach((sub: any, i: number) => {
                    addLog(`  [${i}] ${sub.isWNS ? '🪟 WNS' : '🌐 Outro'}`)
                    addLog(`      Criado: ${new Date(sub.createdAt).toLocaleString()}`)
                })
            } else {
                addLog(`❌ Erro: ${data.error}`)
            }
        } catch (error) {
            addLog(`❌ Erro: ${error}`)
        }
    }

    const refreshSubscription = async () => {
        try {
            addLog('🔄 Renovando subscription...')

            const reg = await navigator.serviceWorker.ready
            const oldSub = await reg.pushManager.getSubscription()

            if (oldSub) {
                await oldSub.unsubscribe()
                addLog('✅ Subscription antiga removida')
            }

            // Aguarda um pouco
            await new Promise(resolve => setTimeout(resolve, 500))

            // Cria nova subscription
            const newSub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
                ),
            })

            addLog('✅ Nova subscription criada!')
            addLog(`📱 Endpoint: ${newSub.endpoint.substring(0, 50)}...`)

            // Salva no servidor
            const session = await fetch('/api/auth/get-session').then(r => r.json())
            if (session?.user?.id) {
                const response = await fetch('/api/save-subscription', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: session.user.id,
                        subscription: newSub.toJSON()
                    })
                })

                if (response.ok) {
                    addLog('✅ Subscription salva no servidor')
                    setSubscription(newSub)
                } else {
                    addLog('❌ Erro ao salvar no servidor')
                }
            }
        } catch (error) {
            addLog(`❌ Erro: ${error}`)
        }
    }

    function urlBase64ToUint8Array(base64String: string) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }


    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    🔍 Edge Notification Tester
                    {isEdge && <Badge variant="default">Edge Detected</Badge>}
                </CardTitle>
                <CardDescription>
                    Ferramenta de diagnóstico para notificações no Microsoft Edge
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Status */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                        <p className="text-sm font-medium">Permissão</p>
                        <Badge variant={permission === 'granted' ? 'default' : 'destructive'}>
                            {permission}
                        </Badge>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Subscription</p>
                        <Badge variant={subscription ? 'default' : 'secondary'}>
                            {subscription ? 'Ativa' : 'Inativa'}
                        </Badge>
                    </div>
                    <div>
                        <p className="text-sm font-medium">SW Version</p>
                        <Badge variant="outline">{swVersion}</Badge>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Navegador</p>
                        <Badge variant={isEdge ? 'default' : 'secondary'}>
                            {isEdge ? 'Edge' : 'Outro'}
                        </Badge>
                    </div>
                </div>

                {/* Ações */}
                <div className="grid grid-cols-3 gap-2">
                    <Button onClick={requestPermission} variant="outline" size="sm">
                        🔔 Solicitar Permissão
                    </Button>
                    <Button onClick={testLocalNotification} variant="outline" size="sm">
                        📱 Teste Local
                    </Button>
                    <Button onClick={testPushSimulation} variant="outline" size="sm">
                        📤 Simular Push
                    </Button>
                    <Button onClick={testRealPush} variant="default" size="sm">
                        🚀 Push Real (API)
                    </Button>
                    <Button onClick={checkSubscriptions} variant="outline" size="sm">
                        🔍 Ver Subscriptions
                    </Button>
                    <Button onClick={refreshSubscription} variant="secondary" size="sm">
                        🔄 Renovar Subscription
                    </Button>
                    <Button onClick={checkSwVersion} variant="outline" size="sm">
                        📋 Versão SW
                    </Button>
                    <Button onClick={unregisterSW} variant="destructive" size="sm">
                        🗑️ Remover SW
                    </Button>
                </div>

                {/* Logs */}
                <div className="space-y-2">
                    <h3 className="text-sm font-medium">Logs</h3>
                    <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs h-64 overflow-y-auto">
                        {logs.length === 0 ? (
                            <p className="text-gray-500">Nenhum log ainda...</p>
                        ) : (
                            logs.map((log, i) => (
                                <div key={i} className="mb-1">
                                    {log}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Instruções */}
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm space-y-2">
                    <h4 className="font-semibold">📋 Instruções para Debug:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                        <li>Verifique se a permissão está "granted"</li>
                        <li>Clique em "Teste Local" - deve aparecer notificação</li>
                        <li>Clique em "Simular Push" - deve aparecer notificação via SW</li>
                        <li>Se não funcionar, clique em "Remover SW" e recarregue</li>
                        <li>Abra DevTools (F12) → Console para ver logs do SW</li>
                        <li>Verifique Application → Service Workers → versão v1.0.4</li>
                    </ol>
                </div>
            </CardContent>
        </Card>
    )
}
