# Dokument wymagań produktu (PRD) - Build Errors
## 1. Przegląd produktu
"Build Errors" to rozszerzenie dla Visual Studio Code, którego celem jest usprawnienie procesu analizy błędów i ostrzeżeń generowanych podczas kompilacji projektów C#. Produkt wprowadza dedykowany panel w interfejsie użytkownika, który parsuje i prezentuje dane wyjściowe z komendy `dotnet build` w ustrukturyzowanej i czytelnej formie. Główne funkcje obejmują automatyczne monitorowanie terminala, grupowanie problemów według plików, nawigację do kodu źródłowego oraz opcje filtrowania, co ma na celu zapewnienie deweloperom czystszego i bardziej skoncentrowanego widoku na problemy w projekcie, podobnie jak w zintegrowanych środowiskach programistycznych (IDE) takich jak Visual Studio.

## 2. Problem użytkownika
Standardowa zakładka "Problemy" oraz zintegrowany terminal w Visual Studio Code często stają się nieczytelne i przepełnione informacjami podczas kompilacji projektów C#, zwłaszcza w większych rozwiązaniach. Deweloperom brakuje jasnego, zorganizowanego przeglądu wyłącznie błędów i ostrzeżeń pochodzących z kompilatora. Potrzebne jest dedykowane narzędzie, które odfiltruje zbędne komunikaty i przedstawi kluczowe problemy w sposób ułatwiających ich szybką identyfikację i nawigację.

## 3. Wymagania funkcjonalne
- FR-001: Rozszerzenie musi monitorować aktywny terminal w VS Code w celu przechwytywania danych wyjściowych generowanych przez komendę `dotnet build`.
- FR-002: Parser musi analizować dane wyjściowe i wyodrębniać z nich wyłącznie błędy i ostrzeżenia kompilatora.
- FR-003: Wspierane wersje .NET SDK to .NET 8 i .NET 9 przy domyślnym poziomie szczegółowości (`normal`).
- FR-004: W interfejsie użytkownika musi istnieć dedykowany panel o tytule "Build Errors".
- FR-005: Panel musi wyświetlać problemy w formie drzewa, z problemami pogrupowanymi pod węzłami reprezentującymi pliki.
- FR-006: Ścieżki do plików w widoku drzewa muszą być wyświetlane jako względne w stosunku do korzenia obszaru roboczego.
- FR-007: W panelu muszą znajdować się dwa niezależne przyciski filtrujące: "Errors" i "Warnings", działające jako przełączniki.
- FR-008: Przyciski filtrów muszą wyświetlać aktualną liczbę błędów i ostrzeżeń.
- FR-009: Stan aktywnych filtrów musi być zapamiętywany globalnie pomiędzy sesjami VS Code.
- FR-010: Kliknięcie na problem na liście musi powodować otwarcie odpowiedniego pliku i ustawienie kursora na linii i kolumnie wskazanej w problemie.
- FR-011: Po najechaniu kursorem na problem z długim komunikatem musi pojawić się dymek (tooltip) z pełną treścią komunikatu.
- FR-012: Długie komunikaty w widoku listy muszą być skracane i kończyć się wielokropkiem ("...").
- FR-013: Jeśli plik lub linia powiązana z problemem nie istnieje, po kliknięciu wpis musi zostać usunięty z listy.
- FR-014: W panelu musi znajdować się przycisk "Wyczyść" (ikona `trash`), który usuwa wszystkie problemy z listy, nie zmieniając stanu filtrów.
- FR-015: Panel musi odpowiednio zarządzać swoim stanem, wyświetlając tekst "Brak danych" przy starcie lub po wyczyszczeniu.

## 4. Granice produktu
W ramach wersji MVP, produkt *nie będzie* posiadał następujących funkcji:
- Wsparcie dla języków programowania innych niż C#.
- Automatyczne wywoływanie procesu kompilacji. Użytkownik musi ręcznie uruchomić komendę `dotnet build`.
- Dostarczanie sugestii poprawek (quick fixes).
- Integracja z zewnętrznymi serwisami, takimi jak Microsoft Docs czy Stack Overflow.
- Przechowywanie historii błędów z poprzednich kompilacji.
- Oficjalne wsparcie dla obszarów roboczych z wieloma folderami (multi-root workspaces).
- Wsparcie dla wersji .NET SDK innych niż .NET 8 i .NET 9.
- Proaktywne monitorowanie zmian w plikach w celu weryfikacji aktualności błędów.

## 5. Historyjki użytkowników

- ID: US-001
- Tytuł: Automatyczne parsowanie wyników kompilacji
- Opis: Jako deweloper, po uruchomieniu komendy `dotnet build` w aktywnym terminalu, chcę, aby rozszerzenie automatycznie przechwyciło i przeanalizowało jej dane wyjściowe w poszukiwaniu błędów i ostrzeżeń.
- Kryteria akceptacji:
    1. Rozszerzenie nasłuchuje na zapisy w aktywnym terminalu VS Code.
    2. Po wykryciu danych z `dotnet build`, dane te są przekazywane do parsera.
    3. Parser poprawnie identyfikuje i tworzy listę obiektów reprezentujących błędy i ostrzeżenia.
    4. Panel "Build Errors" jest automatycznie odświeżany wynikami parsowania.
    5. Proces kompilacji niezwiązany z `dotnet build` jest ignorowany.

- ID: US-002
- Tytuł: Wyświetlanie problemów w formie drzewa
- Opis: Jako deweloper, chcę widzieć błędy i ostrzeżenia w panelu "Build Errors" pogrupowane według plików, w których wystąpiły, abym mógł łatwo zorientować się w skali problemów w poszczególnych częściach projektu.
- Kryteria akceptacji:
    1. Panel wyświetla listę problemów jako drzewo.
    2. Elementy najwyższego poziomu w drzewie reprezentują pliki i wyświetlają ich względną ścieżkę.
    3. Każdy element pliku można rozwinąć, aby zobaczyć listę problemów, które w nim występują.
    4. Każdy problem na liście jest oznaczony odpowiednią ikoną (błąd/ostrzeżenie) i wyświetla numer linii oraz komunikat.
    5. Problemy w obrębie jednego pliku są posortowane rosnąco według numeru linii.

- ID: US-003
- Tytuł: Nawigacja do kodu źródłowego
- Opis: Jako deweloper, chcę po kliknięciu na konkretny problem na liście zostać przeniesiony bezpośrednio do jego lokalizacji w kodzie, aby móc natychmiast rozpocząć jego naprawę.
- Kryteria akceptacji:
    1. Pojedyncze kliknięcie na wpis problemu w drzewie powoduje otwarcie powiązanego pliku.
    2. Kursor w otwartym pliku jest automatycznie ustawiany na linii i kolumnie wskazanej w komunikacie o błędzie/ostrzeżeniu.

- ID: US-004
- Tytuł: Filtrowanie wyników (Błędy i Ostrzeżenia)
- Opis: Jako deweloper, chcę mieć możliwość filtrowania listy problemów, aby widzieć tylko błędy, tylko ostrzeżenia, lub oba naraz, co pozwoli mi skupić się na najważniejszych dla mnie kwestiach.
- Kryteria akceptacji:
    1. W panelu widoczne są dwa przyciski: "Errors" i "Warnings".
    2. Każdy przycisk działa jak przełącznik (toggle) i może być włączony lub wyłączony niezależnie.
    3. Wyłączenie filtra "Errors" ukrywa wszystkie błędy z listy.
    4. Wyłączenie filtra "Warnings" ukrywa wszystkie ostrzeżenia z listy.
    5. Włączenie obu filtrów pokazuje zarówno błędy, jak i ostrzeżenia.
    6. Wyłączenie obu filtrów powoduje wyświetlenie pustej listy.

- ID: US-005
- Tytuł: Wyświetlanie liczników problemów
- Opis: Jako deweloper, chcę, aby przyciski filtrów "Errors" i "Warnings" wyświetlały liczbę znalezionych problemów danego typu, co da mi szybki wgląd w ogólną kondycję projektu.
- Kryteria akceptacji:
    1. Przycisk "Errors" wyświetla tekst w formacie "X Errors", gdzie X to całkowita liczba błędów.
    2. Przycisk "Warnings" wyświetla tekst w formacie "Y Warnings", gdzie Y to całkowita liczba ostrzeżeń.
    3. Liczniki aktualizują się po każdej nowej kompilacji.
    4. Aktywny filtr jest wizualnie wyróżniony (np. za pomocą obramowania).

- ID: US-006
- Tytuł: Zapamiętywanie stanu filtrów
- Opis: Jako deweloper, chcę, aby moje ustawienia filtrów były zapamiętywane, abym nie musiał ich konfigurować na nowo po każdym ponownym uruchomieniu VS Code.
- Kryteria akceptacji:
    1. Stan włączenia/wyłączenia filtrów "Errors" i "Warnings" jest zapisywany.
    2. Po ponownym otwarciu VS Code, filtry są przywracane do ostatnio zapisanego stanu.
    3. Stan jest przechowywany globalnie dla użytkownika.

- ID: US-007
- Tytuł: Ręczne czyszczenie wyników
- Opis: Jako deweloper, chcę mieć możliwość ręcznego wyczyszczenia listy problemów za pomocą dedykowanego przycisku, aby uporządkować mój widok.
- Kryteria akceptacji:
    1. W panelu widoczny jest przycisk "Wyczyść" z ikoną kosza (`trash`).
    2. Kliknięcie przycisku usuwa wszystkie problemy z listy.
    3. Liczniki na przyciskach filtrów resetują się do 0.
    4. Użycie przycisku "Wyczyść" nie zmienia zapisanego stanu filtrów.

- ID: US-008
- Tytuł: Obsługa stanu początkowego i pustego
- Opis: Jako deweloper, po otwarciu panelu po raz pierwszy lub po wyczyszczeniu wyników, chcę zobaczyć pomocniczy komunikat informujący mnie, co zrobić dalej.
- Kryteria akceptacji:
    1. Gdy lista problemów jest pusta (na starcie lub po wyczyszczeniu), panel wyświetla tekst "Brak danych".
    2. Panel nie wyświetla pustego drzewa.

- ID: US-009
- Tytuł: Obsługa nieaktualnych wpisów
- Opis: Jako deweloper, jeśli kliknę na problem, który odnosi się do usuniętego pliku lub zmienionej lokalizacji, chcę, aby ten nieaktualny wpis został automatycznie usunięty z listy.
- Kryteria akceptacji:
    1. Przed próbą nawigacji do problemu, rozszerzenie sprawdza, czy docelowy plik istnieje.
    2. Jeśli plik nie istnieje, wpis jest usuwany z listy w panelu "Build Errors".
    3. VS Code może wyświetlić swoje standardowe powiadomienie o braku pliku.
    4. Wpis jest usuwany także wtedy, gdy plik istnieje, ale wskazana linia jest poza zakresem pliku.

- ID: US-010
- Tytuł: Wyświetlanie pełnego komunikatu błędu
- Opis: Jako deweloper, w przypadku długich i skomplikowanych komunikatów o błędach, chcę mieć łatwy dostęp do ich pełnej treści bez zaśmiecania widoku listy.
- Kryteria akceptacji:
    1. Komunikaty o błędach/ostrzeżeniach, które przekraczają dostępną szerokość w liście, są skracane i zakończone wielokropkiem ("...").
    2. Po najechaniu kursorem myszy na dowolny wpis problemu na liście, pojawia się dymek (tooltip).
    3. Dymek zawiera pełny, nieskrócony komunikat błędu/ostrzeżenia.

## 6. Metryki sukcesu
Dla wersji MVP (Minimum Viable Product) jedynym i kluczowym kryterium sukcesu jest subiektywna ocena i satysfakcja głównego użytkownika (autora rozszerzenia). Celem jest stworzenie narzędzia, które efektywnie usprawnia jego codzienny przepływ pracy. Nie będą śledzone żadne formalne, ilościowe metryki takie jak liczba instalacji, dzienna liczba aktywnych użytkowników czy oceny w VS Code Marketplace. Produkt zostanie uznany za sukces, jeśli spełni osobiste wymagania i oczekiwania jego twórcy. 
