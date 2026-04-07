# Диаграмма последовательности — Редактор кода с ИИ-ассистентом

## Полный цикл ИИ-запроса

```mermaid
sequenceDiagram
    participant U as Пользователь
    participant R as renderer.js
    participant P as preload.js
    participant M as main.js
    participant A as OpenRouter API

    U->>R: Нажимает «Улучшить текст»
    R->>P: improveText(text)
    P->>M: invoke('ai-improve-text')
    M->>A: POST запрос
    A-->>M: Ответ с текстом
    M-->>P: return result
    P-->>R: Promise.resolve
    R-->>U: Показ результата

    alt Ошибка
        A-->>M: Ошибка
        M-->>R: throw Error
        R-->>U: Показ ошибки
    end
```

## Архитектура компонентов

```mermaid
graph TB
    subgraph "Frontend"
        HTML[index.html]
        CSS[styles.css]
        Renderer[renderer.js]
    end

    subgraph "Electron Bridge"
        Preload[preload.js]
        IPCMain[IPC Main Process]
    end

    subgraph "Backend"
        Main[main.js]
        DotEnv[.env]
        HTTPS[https module]
    end

    subgraph "External"
        OpenRouter[OpenRouter API<br/>llama-3.1-8b-instruct]
    end

    HTML --> Renderer
    CSS --> HTML
    Renderer --> Preload
    Preload --> IPCMain
    IPCMain --> Main
    Main --> DotEnv
    Main --> HTTPS
    HTTPS --> OpenRouter
```

## Поток данных ИИ-функций

```mermaid
flowchart LR
    A[Пользователь] -->|Текст| B[renderer.js]
    B -->|improveText| C[preload.js]
    C -->|ai-improve-text| D[main.js]
    D -->|HTTPS POST| E[OpenRouter API]
    E -->|JSON Response| D
    D -->|Улучшенный текст| C
    C -->|Promise| B
    B -->|Результат| A

    style A fill:#e1f5fe
    style B fill:#fff3e0
    style C fill:#f3e5f5
    style D fill:#e8f5e9
    style E fill:#fce4ec
```
