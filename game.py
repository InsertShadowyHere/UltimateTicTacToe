import pygame

pygame.init()

WIDTH, HEIGHT = 940, 940
BOARD_SIZE = 280

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (200, 0, 0)
DARK_RED = (50, 0, 0)
DARK_BLUE = (0, 0, 50)

img_X = pygame.image.load("assets/x.png")
img_X = pygame.transform.scale_by(img_X, 4)
big_img_X = pygame.transform.scale_by(img_X, 5)
img_O = pygame.image.load("assets/o.png")
img_O = pygame.transform.scale_by(img_O, 4)
big_img_O = pygame.transform.scale_by(img_O, 5)
imgs = {1: img_X, 0: img_O}
big_imgs = {1: big_img_X, 0: big_img_O}

screen = pygame.display.set_mode((WIDTH, HEIGHT))
big_font = pygame.font.SysFont("Helvetica", 54)
small_font = pygame.font.SysFont("Helvetica", 28)
pygame.display.set_caption("Ultimate Tic-Tac-Toe")


class Board:
    def __init__(self, pos):
        self.grid = [None] * 9
        self.pos = pos

        self.scored = None

        self.rect = pygame.rect.Rect(pos[0], pos[1], BOARD_SIZE, BOARD_SIZE)

        self.click_rects = []
        for n in range(9):
            self.click_rects.append(
                pygame.rect.Rect(pos[0] + 20 + (82 * (n % 3)), pos[1] + 20 + (82 * (n // 3)), 76, 76))

    def check(self):
        # check for vertical scores
        for i in range(3):
            if self.grid[i] == self.grid[i + 3] == self.grid[i + 6] and self.grid[i] in [0, 1]:
                self.scored = self.grid[i]
        # check for horizontal scores
        for i in range(3):
            if self.grid[i * 3] == self.grid[i * 3 + 1] == self.grid[i * 3 + 2] and self.grid[i * 3] in [0, 1]:
                self.scored = self.grid[i * 3]
        # top left to bottom right diagonal
        if self.grid[0] == self.grid[4] == self.grid[8] and self.grid[0] in [0, 1]:
            self.scored = self.grid[0]
        # top right to bottom left diagonal
        if self.grid[2] == self.grid[4] == self.grid[6] and self.grid[2] in [0, 1]:
            self.scored = self.grid[2]

        if None not in self.grid and self.scored is None:
            self.scored = 2

        if self.scored is not None:
            big_check()

    def mark(self, n):
        global turn, allowed
        if self.grid[n] is not None:
            return

        self.grid[n] = turn
        turn = 0 if turn == 1 else 1
        self.check()

        # calculate new allowed board
        if DEBUG:
            allowed = None
        else:
            allowed = boards[n]
            if allowed.scored is not None:
                allowed = None

    def draw(self):
        """
        we have 240, because we leave a 20 margin

        the actual bounds are 20-260x20-260


        :param pos:
        :return:
        """
        temp_surface = pygame.Surface((BOARD_SIZE, BOARD_SIZE), pygame.SRCALPHA)
        pos = self.pos
        rect1 = (96, 20, 6, 240)
        rect2 = (178, 20, 6, 240)
        pygame.draw.rect(temp_surface, WHITE, rect1)
        pygame.draw.rect(temp_surface, WHITE, rect2)

        rect1 = (20, 96, 240, 6)
        rect2 = (20, 178, 240, 6)
        pygame.draw.rect(temp_surface, WHITE, rect1)
        pygame.draw.rect(temp_surface, WHITE, rect2)

        if self.scored is not None:
            temp_surface.set_alpha(128)
            if self.scored in [0, 1]:
                screen.blit(big_imgs[self.scored], (30 + pos[0], 30 + pos[1]))

        for n, i in enumerate(self.grid):
            if i is not None:
                new_pos = (36 + (82 * (n % 3)), 36 + (82 * (n // 3)))
                temp_surface.blit(imgs[i], new_pos)

        return temp_surface


def big_check():
    global won, allowed
    for i in range(3):
        if boards[i].scored == boards[i + 3].scored == boards[i + 6].scored and boards[i].scored in [0, 1]:
            won = boards[i].scored
        # check for horizontal scores
    for i in range(3):
        if boards[i * 3].scored == boards[i * 3 + 1].scored == boards[i * 3 + 2].scored and boards[
            i * 3].scored in [0, 1]:
            won = boards[i * 3].scored
        # top left to bottom right diagonal
    if boards[0].scored == boards[4].scored == boards[8].scored and boards[0].scored in [0, 1]:
        won = boards[0].scored
        # top right to bottom left diagonal
    if boards[2].scored == boards[4].scored == boards[6].scored and boards[2].scored in [0, 1]:
        won = boards[2].scored
    if won is not None:
        allowed = None


def draw_big_board():
    rect1 = (310, 20, 20, 900)
    rect2 = (610, 20, 20, 900)
    pygame.draw.rect(screen, WHITE, rect1)
    pygame.draw.rect(screen, WHITE, rect2)

    rect1 = (20, 310, 900, 20)
    rect2 = (20, 610, 900, 20)
    pygame.draw.rect(screen, WHITE, rect1)
    pygame.draw.rect(screen, WHITE, rect2)


def render():
    if won is not None and render_won_screen:
        screen.fill(BLACK)
        text1 = big_font.render(f"{'X' if won else 'O'} won the game!", False, WHITE)
        screen.blit(text1, (470 - text1.get_width() // 2, 400))
        subtext = small_font.render("Press v to view board, r to restart", False, WHITE)
        screen.blit(subtext, (470 - subtext.get_width() // 2, 500))
        return

    screen.fill(DARK_RED if turn == 1 else DARK_BLUE)

    draw_big_board()

    # draw individual boards
    for board in boards:
        temp_surface = board.draw()
        if allowed:
            if board is not allowed:
                temp_surface.set_alpha(128)

        screen.blit(temp_surface, board.pos)


def initialize_boards():
    for n in range(9):
        pos = (30 + (300 * (n % 3)), 30 + (300 * (n // 3)))
        boards.append(Board(pos))


boards = []
initialize_boards()
turn = 1
won = None
render_won_screen = True

allowed = None
DEBUG = False

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_d:
                DEBUG = not DEBUG
            if event.key == pygame.K_v:
                render_won_screen = not render_won_screen
            if event.key == pygame.K_r:
                boards = []
                won = None
                render_won_screen = True
                turn = 1
                allowed = None
                initialize_boards()

        if event.type == pygame.MOUSEBUTTONDOWN:
            if won is not None:
                continue
            pos = pygame.mouse.get_pos()
            for board_n, board in enumerate(boards):
                if board.rect.collidepoint(pos):
                    break
            # check if this is the board we're allowed to play in
            if allowed:
                if board != allowed:
                    continue
            # check if board is already scored
            if board.scored is not None:
                continue
            for cell, cell_rect in enumerate(board.click_rects):
                if cell_rect.collidepoint(pos):
                    board.mark(cell)

    render()
    pygame.display.flip()
pygame.quit()
