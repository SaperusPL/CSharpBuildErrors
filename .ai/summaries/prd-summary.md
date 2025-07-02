<conversation_summary>
<decisions>
1.  **Źródło danych:** Rozszerzenie będzie monitorować **aktywny terminal** w poszukiwaniu danych wyjściowych z komendy `dotnet build`.
2.  **Zakres parsowania:** Analizowane będą wyłącznie **błędy (errors)** i **ostrzeżenia (warnings)** dla **.NET 8** i **.NET 9** przy domyślnym poziomie szczegółowości (`normal`).
3.  **Filtrowanie:**
    *   W panelu dostępne będą dwa niezależne przyciski-przełączniki: "Errors" i "Warnings", wizualnie zgodne z dostarczonym obrazkiem (z licznikami i obramowaniem dla aktywnego stanu).
    *   Użytkownik może włączyć/wyłączyć każdy filtr osobno. Gdy oba są wyłączone, lista jest pusta.
    *   Wybór filtrów będzie zapamiętywany globalnie między sesjami VS Code.
4.  **Interfejs i zachowanie panelu:**
    *   Tytuł panelu to **"Build Errors"**.
    *   Panel jest początkowo pusty z tekstem "Brak danych".
    *   Wyniki poprzedniej kompilacji są czyszczone przy starcie nowej. W trakcie kompilacji panel nie wyświetla żadnych dodatkowych informacji.
    *   Obok filtrów znajdzie się przycisk **"Wyczyść"** (ikona `trash`), który tylko opróżnia listę.
    *   Problemy będą wyświetlane w formie **drzewa**, pogrupowane według plików.
    *   Użyte zostaną standardowe ikony VS Code (Codicons).
5.  **Interakcja z listą problemów:**
    *   Kliknięcie na problem nawiguje do pliku i linii.
    *   Jeśli plik/linia nie istnieje, wpis jest **usuwany z listy**, a VS Code pokazuje standardowy błąd.
    *   Długie komunikaty są **skracane z "..."**, a pełna treść jest dostępna w dymku (tooltip).
    *   Problemy w obrębie pliku są sortowane rosnąco według numeru linii.
6.  **Obsługa środowiska:**
    *   Ścieżki do plików są wyświetlane jako **względne**.
    *   Obsługa obszarów roboczych z wieloma folderami (multi-root) jest **poza zakresem MVP**.
7.  **Mierniki sukcesu:** Brak formalnych mierników; sukces definiowany jest przez satysfakcję użytkownika.

</decisions>

<matched_recommendations>
1.  **Implementacja monitorowania terminala:** Należy wykorzystać API `window.onDidWriteTerminalData` dla aktywnego terminala i zdefiniować solidny wzorzec (regex) do identyfikacji początku i końca bloku wyjściowego z `dotnet build`.
2.  **Trwałość stanu filtra:** Należy wykorzystać `Memento API` (w `globalState`) do zapisywania stanu przełączników filtrów.
3.  **Implementacja interfejsu:** Zalecane jest użycie `Webview View` do stworzenia paska z filtrami (przyciski, liczniki), a `TreeView` API do wyświetlania listy problemów w formie drzewa.
4.  **Wydajny i odporny parser:** Parser musi być asynchroniczny i zaprojektowany specyficznie dla wyjścia z `dotnet build` dla .NET 8/9 przy domyślnej szczegółowości. Powinien również obsługiwać błędy wieloliniowe.
5.  **Zarządzanie stanami widoku:** Panel musi jasno komunikować swój stan: początkowy (z tekstem pomocniczym), po udanej kompilacji bez problemów, oraz z listą problemów.
6.  **Użycie ścieżek względnych:** Należy konsekwentnie używać `vscode.workspace.asRelativePath()` do wyświetlania ścieżek, co jest standardem i poprawia czytelność.
7.  **Rejestracja komend:** Zaleca się rejestrację komend (`csharpBuildErrors.setFilter...`, `csharpBuildErrors.clearResults`) dla akcji w UI, aby umożliwić ich wywoływanie z palety komend i przypisanie skrótów klawiszowych.
</matched_recommendations>

<prd_planning_summary>
### Główne wymagania funkcjonalne
Produkt to rozszerzenie do VS Code o nazwie "Build Errors", które stanowi uzupełnienie dla standardowej zakładki "Problems". Jego głównym zadaniem jest parsowanie wyjścia z komendy `dotnet build` dla .NET 8 i 9, a następnie wyświetlanie błędów i ostrzeżeń w dedykowanym panelu. Rozszerzenie musi automatycznie wykrywać start kompilacji w aktywnym terminalu i odświeżać wyniki. Użytkownik otrzyma możliwość filtrowania listy, aby wyświetlić tylko błędy, tylko ostrzeżenia, lub oba. Interfejs filtrów będzie zawierał liczniki znalezionych problemów. Kliknięcie na problem przeniesie użytkownika do dokładnej lokalizacji w kodzie.

### Kluczowe historie użytkownika i ścieżki korzystania
*   **Ścieżka główna:**
    1.  Deweloper uruchamia komendę `dotnet build` w zintegrowanym terminalu VS Code.
    2.  Rozszerzenie "Build Errors" automatycznie przechwytuje i parsuje dane wyjściowe.
    3.  Panel "Build Errors" odświeża się, wyświetlając listę błędów i ostrzeżeń pogrupowanych według plików.
    4.  Deweloper klika na błąd, co powoduje otwarcie odpowiedniego pliku i przejście do wskazanej linii.
    5.  Deweloper poprawia kod i ponownie uruchamia kompilację, powtarzając cykl.
*   **Filtrowanie wyników:**
    1.  W panelu "Build Errors" deweloper widzi przyciski "Errors" i "Warnings" z liczbą problemów.
    2.  Aby skupić się na krytycznych problemach, klika przycisk "Warnings", aby go wyłączyć.
    3.  Lista dynamicznie odświeża się, pokazując już tylko błędy.
    4.  Wybór filtra zostaje zapamiętany na potrzeby przyszłych sesji.

### Kryteria sukcesu
Dla MVP jedynym kryterium sukcesu jest subiektywna ocena i satysfakcja głównego użytkownika (autora rozszerzenia) z jego działania jako narzędzia ułatwiającego codzienną pracę. Nie definiuje się żadnych mierzalnych wskaźników, takich jak liczba pobrań czy oceny w marketplace.

</prd_planning_summary>

<unresolved_issues>
Na obecnym etapie planowania MVP nie zidentyfikowano żadnych krytycznych, nierozwiązanych kwestii. Następujące punkty zostały świadomie odłożone na przyszłość:
1.  **Obsługa obszarów roboczych z wieloma folderami (multi-root workspaces):** MVP będzie testowane i oficjalnie wspierane tylko dla projektów z jednym folderem.
2.  **Obsługa innych wersji .NET SDK:** MVP skupia się wyłącznie na .NET 8 i 9.
3.  **Zaawansowane monitorowanie w tle:** Weryfikacja istnienia błędów odbywa się tylko przy kliknięciu, a nie proaktywnie.
</unresolved_issues>
</conversation_summary> 
