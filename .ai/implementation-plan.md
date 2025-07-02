# Przewodnik Implementacji - Rozszerzenie "Build Errors"

## 1. Opis usługi
Głównym elementem architektury będzie klasa kontrolera, np. `BuildErrorsController`, która będzie orkiestrować działanie całego rozszerzenia. Będzie ona odpowiedzialna za inicjalizację wszystkich komponentów, zarządzanie ich cyklem życia i przekazywanie zależności. Pozostałe komponenty będą wyspecjalizowanymi klasami.

- `TerminalMonitor`: Usługa odpowiedzialna za nasłuchiwanie na dane z aktywnego terminala i identyfikowanie bloków wyjściowych z `dotnet build`.
- `BuildOutputParser`: Statyczna klasa lub usługa, która przyjmuje surowy tekst z kompilacji i zwraca ustrukturyzowaną listę problemów.
- `StateManager`: Centralne repozytorium stanu aplikacji. Przechowuje listę problemów, stan filtrów oraz ich liczniki. Używa wzorca `EventEmitter` do powiadamiania o zmianach.
- `ProblemsTreeProvider`: Implementacja `vscode.TreeDataProvider`, która renderuje widok drzewa z problemami na podstawie danych ze `StateManager`.
- `FiltersViewProvider`: Implementacja `vscode.WebviewViewProvider`, która renderuje panel z przyciskami filtrów i komunikuje się z `StateManager` w celu aktualizacji stanu i UI.

## 2. Opis konstruktora
Konstruktor klasy `BuildErrorsController` przyjmie jako argument kontekst rozszerzenia `vscode.ExtensionContext`.

```typescript
// BuildErrorsController.ts
import * as vscode from 'vscode';
import { StateManager } from './StateManager';
import { TerminalMonitor } from './TerminalMonitor';
import { ProblemsTreeProvider } from './ProblemsTreeProvider';
import { FiltersViewProvider } from './FiltersViewProvider';

export class BuildErrorsController {
    private context: vscode.ExtensionContext;
    private stateManager: StateManager;
    private terminalMonitor: TerminalMonitor;
    private problemsTreeProvider: ProblemsTreeProvider;
    private filtersViewProvider: FiltersViewProvider;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        
        // Inicjalizacja komponentów
        this.stateManager = new StateManager(context.globalState);
        this.terminalMonitor = new TerminalMonitor();
        
        this.problemsTreeProvider = new ProblemsTreeProvider(this.stateManager);
        this.filtersViewProvider = new FiltersViewProvider(context.extensionUri, this.stateManager);

        this.registerViews();
        this.registerCommands();
        this.setupEventListeners();
    }
}
```

## 3. Publiczne metody i pola
Klasa `BuildErrorsController` będzie miała jedną publiczną metodę.

- `dispose()`: Zwalnia wszystkie zasoby, takie jak subskrypcje i event listenery, gdy rozszerzenie jest deaktywowane.

## 4. Prywatne metody i pola
- `registerViews()`: Rejestruje `TreeView` dla listy problemów i `WebviewView` dla filtrów.
    - `vscode.window.registerWebviewViewProvider('build-errors.filtersView', this.filtersViewProvider);`
    - `vscode.window.createTreeView('build-errors.problemsView', { treeDataProvider: this.problemsTreeProvider });`
- `registerCommands()`: Rejestruje komendy, które mogą być wywoływane z UI (np. przez webview) lub palety komend.
    - Komenda do nawigacji do problemu.
    - Komendy do zmiany filtrów i czyszczenia widoku (które będą wywoływane przez `FiltersViewProvider`).
- `setupEventListeners()`: Ustawia nasłuchiwanie na zdarzenia z innych komponentów.
    - Nasłuchuje na zdarzenie `onBuildOutput` z `TerminalMonitor`. Gdy je otrzyma, przekazuje dane do `BuildOutputParser`.
    - Wyniki z parsera przekazuje do `StateManager`.
    - `StateManager` za pomocą własnych zdarzeń poinformuje `ProblemsTreeProvider` i `FiltersViewProvider` o konieczności odświeżenia UI.

## 5. Obsługa błędów
- Błędy parsowania: Parser, oparty na wyrażeniach regularnych, będzie ignorował linie, które nie pasują do wzorca błędu/ostrzeżenia. Pozwoli to uniknąć zaśmiecania widoku i błędów wykonania. Wszelkie krytyczne błędy samego parsera będą logowane do konsoli deweloperskiej rozszerzenia za pomocą `console.error`.
- Błędy nawigacji: Zgodnie z wymaganiem US-009, przed próbą otwarcia pliku i nawigacji do linii, rozszerzenie sprawdzi jego istnienie i zakres linii. Jeśli walidacja się nie powiedzie, problem zostanie usunięty ze `StateManager`, a UI zostanie odświeżone. Użytkownik zobaczy standardowy komunikat VS Code, jeśli plik nie istnieje.
- Błędy asynchroniczne: Wszystkie operacje asynchroniczne będą opakowane w bloki `try...catch`, aby zapobiec nieoczekiwanemu przerwaniu działania rozszerzenia.

## 6. Kwestie bezpieczeństwa
- `Webview`: Panel filtrów będzie używał `Webview`. Należy zadbać o jego bezpieczeństwo:
    1. Ustawić `vscode.WebviewOptions` z `enableScripts: true`, ale `localResourceRoots` ograniczyć tylko do folderu, z którego serwowane są zasoby (np. `media`).
    2. Wszystkie dane przekazywane z rozszerzenia do webview muszą być odpowiednio oczyszczone (sanitized), aby zapobiec wstrzykiwaniu skryptów, chociaż w tym MVP dane są proste (liczniki, stan boolean).
    3. Webview powinien mieć zdefiniowaną politykę `Content-Security-Policy`, która ogranicza ładowanie zasobów tylko do zaufanych źródeł.

## 7. Plan wdrożenia krok po kroku

1.  *Konfiguracja projektu i szkielet rozszerzenia:*
    -   Zainicjowanie podstawowego projektu rozszerzenia VS Code.
    -   Zdefiniowanie punktów kontrybucji (`contributes`) w `package.json`: widok kontenera (`activitybar`), widoki (`views`), oraz komendy.
    -   Stworzenie szkieletów klas: `BuildErrorsController`, `StateManager`, `TerminalMonitor`, `ProblemsTreeProvider`, `FiltersViewProvider`.

2.  *Implementacja `StateManager` (FR-009, US-006):*
    -   Stworzenie logiki do przechowywania listy problemów i stanu filtrów.
    -   Implementacja `vscode.EventEmitter` do powiadamiania o zmianach.
    -   Integracja z `Memento API` (`context.globalState`) w celu zapisu i odczytu stanu filtrów.

3.  *Implementacja `ProblemsTreeProvider` (FR-005, US-002):*
    -   Implementacja interfejsu `TreeDataProvider`.
    -   Podłączenie go do `StateManager`, aby reagował na zmiany i odświeżał drzewo.
    -   Implementacja grupowania problemów po plikach.
    -   Definicja wyglądu elementów drzewa (`TreeItem`), w tym ikon i etykiet.

4.  *Implementacja parsera i monitora terminala (FR-001, US-001):*
    -   Stworzenie solidnego wyrażenia regularnego do parsowania błędów i ostrzeżeń z `dotnet build` dla .NET 8/9.
    -   Implementacja `TerminalMonitor` z użyciem `window.onDidWriteTerminalData` do przechwytywania danych wyjściowych.
    -   Połączenie monitora z parserem i `StateManager` – po zakończeniu kompilacji, nowe problemy są ustawiane w stanie.

5.  *Implementacja `FiltersViewProvider` z `Webview` (FR-007, FR-008, US-004, US-005):*
    -   Stworzenie pliku HTML/CSS/JS dla interfejsu filtrów, zgodnie z dostarczonym obrazkiem.
    -   Implementacja `WebviewViewProvider` do renderowania tego interfejsu.
    -   Stworzenie dwukierunkowej komunikacji (`postMessage`) między webview a rozszerzeniem w celu obsługi kliknięć i aktualizacji liczników.

6.  *Implementacja interakcji (FR-010, FR-013, FR-014, US-003, US-007, US-009):*
    -   Zdefiniowanie komendy nawigacyjnej i powiązanie jej z akcją kliknięcia na elemencie drzewa.
    -   Implementacja logiki usuwania nieaktualnych wpisów.
    -   Podłączenie przycisku "Wyczyść" z webview do akcji w `StateManager`.

7.  *Dopracowanie UI i obsługa stanów (FR-012, FR-015, US-008, US-010):*
    -   Implementacja wyświetlania pełnego komunikatu w dymku (tooltip) dla elementów drzewa.
    -   Obsługa skracania długich komunikatów.
    -   Zaimplementowanie wyświetlania komunikatu "Brak danych" w `TreeView` za pomocą właściwości `message`, gdy lista jest pusta.

8.  *Testowanie i refaktoryzacja:*
    -   Manualne testowanie wszystkich historyjek użytkownika na przykładowym projekcie C#.
    -   Przegląd kodu, refaktoryzacja i dodanie komentarzy w kluczowych miejscach.
    -   Weryfikacja, czy wszystkie wymagania z PRD zostały spełnione. 
